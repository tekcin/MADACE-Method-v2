import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/v3/workflows/[id]/stream
 * Server-Sent Events endpoint for live workflow updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let lastState: string | null = null;

      // Poll workflow state every 500ms
      const interval = setInterval(async () => {
        try {
          const stateDir = path.join(process.cwd(), '.madace', 'workflow-states');
          const stateFile = path.join(stateDir, `.${id}.state.json`);

          const stateContent = await fs.readFile(stateFile, 'utf-8').catch(() => null);

          if (!stateContent) {
            return;
          }

          // Only send update if state changed
          if (stateContent !== lastState) {
            const state = JSON.parse(stateContent);
            lastState = stateContent;

            // Send state update
            sendEvent({ type: 'state', state });

            // Check for completion
            if (state.completed) {
              sendEvent({ type: 'completed' });
              clearInterval(interval);
              controller.close();
              return;
            }

            // Check for waiting input
            if (state.variables._WAITING_FOR_INPUT) {
              sendEvent({
                type: 'waiting_input',
                step: state.variables._WAITING_FOR_INPUT,
              });
            }

            // Send step progress
            if (state.currentStep !== undefined) {
              sendEvent({
                type: 'progress',
                currentStep: state.currentStep,
                totalSteps: state.variables._TOTAL_STEPS || 0,
              });
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          sendEvent({
            type: 'error',
            error: errorMsg,
          });
        }
      }, 500);

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });

      // Send initial ping
      sendEvent({ type: 'connected', message: 'Stream connected' });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
    },
  });
}
