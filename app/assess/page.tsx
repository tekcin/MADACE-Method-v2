'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentForm } from '@/components/features/AssessmentForm';
import { AssessmentResult } from '@/components/features/AssessmentResult';
import { assessComplexity } from '@/lib/workflows/complexity-assessment';
import type { ProjectInput } from '@/lib/workflows/complexity-types';
import type { AssessmentResult as AssessmentResultType } from '@/lib/types/setup';

const STORAGE_KEY = 'madace-assessment-form-state';

export default function AssessPage() {
  const router = useRouter();
  const [input, setInput] = useState<Partial<ProjectInput>>({});
  const [assessment, setAssessment] = useState<AssessmentResultType | null>(null);
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean;
    type: 'markdown' | 'json' | null;
    content: string;
  }>({ isOpen: false, type: null, content: '' });

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setInput(parsedState);
      }
    } catch (error) {
      console.error('Failed to load saved assessment state:', error);
    }
  }, []);

  // Save state to localStorage whenever input changes
  useEffect(() => {
    if (Object.keys(input).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
      } catch (error) {
        console.error('Failed to save assessment state:', error);
      }
    }
  }, [input]);

  // Auto-assess when all fields are filled
  useEffect(() => {
    const {
      projectSize,
      teamSize,
      codebaseComplexity,
      integrations,
      userBase,
      security,
      duration,
      existingCode,
    } = input;

    if (
      projectSize !== undefined &&
      teamSize !== undefined &&
      codebaseComplexity !== undefined &&
      integrations !== undefined &&
      userBase !== undefined &&
      security !== undefined &&
      duration !== undefined &&
      existingCode !== undefined
    ) {
      const result = assessComplexity({
        projectSize,
        teamSize,
        codebaseComplexity,
        integrations,
        userBase,
        security,
        duration,
        existingCode,
      });
      setAssessment(result);
    } else {
      setAssessment(null);
    }
  }, [input]);

  const handleInputChange = (field: keyof ProjectInput, value: number) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all assessment data? This cannot be undone.')) {
      setInput({});
      setAssessment(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExportMarkdown = () => {
    if (!assessment) return;

    const markdown = generateMarkdownReport(assessment);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scale-assessment.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!assessment) return;

    const json = JSON.stringify(assessment, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert('Assessment JSON copied to clipboard!');
    });
  };

  const handleSaveToProject = async () => {
    if (!assessment) return;

    try {
      // TODO: Implement API endpoint to save to madace-data/docs/scale-assessment.md
      // For now, just download it
      handleExportMarkdown();
      alert('Assessment saved! (Note: Server-side save not yet implemented, downloaded instead)');
    } catch (error) {
      console.error('Failed to save assessment:', error);
      alert('Failed to save assessment to project');
    }
  };

  // View handlers
  const handleViewMarkdown = () => {
    if (!assessment) return;
    const markdown = generateMarkdownReport(assessment);
    setViewerModal({ isOpen: true, type: 'markdown', content: markdown });
  };

  const handleViewJSON = () => {
    if (!assessment) return;
    const json = JSON.stringify(assessment, null, 2);
    setViewerModal({ isOpen: true, type: 'json', content: json });
  };

  const handleCloseViewer = () => {
    setViewerModal({ isOpen: false, type: null, content: '' });
  };

  // Implementation action handlers
  const handleStartWorkflow = () => {
    if (!assessment) return;

    // Navigate to workflows page with recommended workflow as query param
    const workflowName = assessment.recommendedWorkflow
      .replace('.yaml', '')
      .replace('.workflow', '');
    router.push(`/workflows?workflow=${encodeURIComponent(workflowName)}`);
  };

  const handleCreateProject = async () => {
    if (!assessment) return;

    try {
      const levelNames = ['Minimal', 'Basic', 'Standard', 'Comprehensive', 'Enterprise'];
      const projectName = `New ${levelNames[assessment.level]} Project`;

      // Create project via API
      const response = await fetch('/api/v3/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description: `Project assessed as Level ${assessment.level} (${levelNames[assessment.level]}) with ${assessment.totalScore}/40 points. Recommended workflow: ${assessment.recommendedWorkflow}`,
        }),
      });

      if (response.ok) {
        const { data: _projectData } = await response.json();
        alert(
          `✅ Project Created Successfully!\n\n` +
            `Project: "${projectName}"\n` +
            `Complexity Level: ${levelNames[assessment.level]}\n` +
            `Score: ${assessment.totalScore}/40 points\n` +
            `Recommended Workflow: ${assessment.recommendedWorkflow}\n\n` +
            `You can now start working on this project!`
        );
        // Future: navigate to project page
        // router.push(`/projects/${_projectData.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to create project: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleApplyConfiguration = () => {
    if (!assessment) return;

    // Save assessment to localStorage for MADACE configuration
    const levelNames = ['Minimal', 'Basic', 'Standard', 'Comprehensive', 'Enterprise'];
    localStorage.setItem('madace-assessment', JSON.stringify(assessment));
    localStorage.setItem('madace-complexity-level', assessment.level.toString());
    localStorage.setItem('madace-recommended-workflow', assessment.recommendedWorkflow);

    alert(
      `✅ Configuration Applied Successfully!\n\n` +
        `Complexity Level: ${levelNames[assessment.level]}\n` +
        `Recommended Workflow: ${assessment.recommendedWorkflow}\n` +
        `Total Score: ${assessment.totalScore}/40 points\n\n` +
        `This configuration will be used for future MADACE operations.`
    );
  };

  const handleViewWorkflowDetails = () => {
    // Navigate to workflows page
    router.push('/workflows');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Project Complexity Assessment
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Determine the recommended planning level for your project by answering 8 key
                questions
              </p>
            </div>
            {Object.keys(input).length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                title="Clear all assessment data"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Assessment Form */}
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <AssessmentForm input={input} onChange={handleInputChange} />
          </div>

          {/* Assessment Result */}
          {assessment && (
            <AssessmentResult
              assessment={assessment}
              onExportMarkdown={handleExportMarkdown}
              onExportJSON={handleExportJSON}
              onSaveToProject={handleSaveToProject}
              onViewMarkdown={handleViewMarkdown}
              onViewJSON={handleViewJSON}
              onStartWorkflow={handleStartWorkflow}
              onCreateProject={handleCreateProject}
              onApplyConfiguration={handleApplyConfiguration}
              onViewWorkflowDetails={handleViewWorkflowDetails}
            />
          )}

          {/* Empty State */}
          {!assessment && Object.keys(input).length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-sm">
                  Fill in all 8 criteria above to see your assessment result
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Viewer Modal */}
        {viewerModal.isOpen && (
          <div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
            onClick={handleCloseViewer}
          >
            <div
              className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {viewerModal.type === 'markdown' ? 'Markdown Report' : 'JSON Data'}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseViewer}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[70vh] overflow-auto p-6">
                <pre className="rounded-lg bg-gray-50 p-4 font-mono text-sm break-words whitespace-pre-wrap text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  {viewerModal.content}
                </pre>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewerModal.content);
                    alert('Content copied to clipboard!');
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Copy to Clipboard
                </button>
                <button
                  type="button"
                  onClick={handleCloseViewer}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function generateMarkdownReport(assessment: AssessmentResultType): string {
  const levelNames = ['Minimal', 'Basic', 'Standard', 'Comprehensive', 'Enterprise'];
  const date = new Date().toISOString().split('T')[0];

  return `# Project Complexity Assessment

**Assessment Date:** ${date}
**Recommended Level:** Level ${assessment.level} (${levelNames[assessment.level]})
**Total Score:** ${assessment.totalScore}/40 points (${Math.round((assessment.totalScore / 40) * 100)}%)

## Executive Summary

Your project has been assessed as **Level ${assessment.level} (${levelNames[assessment.level]})** based on complexity analysis.

**Recommended Workflow:** ${assessment.recommendedWorkflow}

## Criteria Breakdown

| Criterion | Score | Max | Percentage |
|-----------|-------|-----|------------|
| Project Size | ${assessment.breakdown.projectSize} | 5 | ${Math.round((assessment.breakdown.projectSize / 5) * 100)}% |
| Team Size | ${assessment.breakdown.teamSize} | 5 | ${Math.round((assessment.breakdown.teamSize / 5) * 100)}% |
| Codebase Complexity | ${assessment.breakdown.codebaseComplexity} | 5 | ${Math.round((assessment.breakdown.codebaseComplexity / 5) * 100)}% |
| Integrations | ${assessment.breakdown.integrations} | 5 | ${Math.round((assessment.breakdown.integrations / 5) * 100)}% |
| User Base | ${assessment.breakdown.userBase} | 5 | ${Math.round((assessment.breakdown.userBase / 5) * 100)}% |
| Security | ${assessment.breakdown.security} | 5 | ${Math.round((assessment.breakdown.security / 5) * 100)}% |
| Duration | ${assessment.breakdown.duration} | 5 | ${Math.round((assessment.breakdown.duration / 5) * 100)}% |
| Existing Code | ${assessment.breakdown.existingCode} | 5 | ${Math.round((assessment.breakdown.existingCode / 5) * 100)}% |

## Level Characteristics

### Level ${assessment.level}: ${levelNames[assessment.level]}

${getLevelDescription(assessment.level)}

## Next Steps

1. Review the recommended workflow: \`${assessment.recommendedWorkflow}\`
2. Set up your MADACE configuration to match Level ${assessment.level}
3. Start with the appropriate planning documentation
4. Adjust planning depth based on team preferences if needed

---

*Generated by MADACE Method v3.0 - Complexity Assessment Tool*
*Assessment Timestamp: ${assessment.assessedAt?.toString() || date}*
`;
}

function getLevelDescription(level: number): string {
  const descriptions = [
    `**Minimal Planning** - Suitable for simple scripts or prototypes.
- Direct to story creation
- No formal documentation required
- Focus on rapid iteration`,

    `**Basic Planning** - Suitable for small teams with straightforward projects.
- Lightweight PRD
- Story breakdown with acceptance criteria
- Basic architecture notes
- Minimal process overhead`,

    `**Standard Planning** - Suitable for medium-sized projects with moderate complexity.
- Complete PRD with user stories
- Basic architecture documentation
- Epic and story breakdown
- Standard Agile ceremonies`,

    `**Comprehensive Planning** - Suitable for large, complex projects.
- Detailed PRD and technical specifications
- Complete architecture documentation
- Security and compliance planning
- Epic breakdown with dependencies
- Full Agile process`,

    `**Enterprise Planning** - Suitable for mission-critical systems.
- Extensive technical specifications
- Enterprise architecture documentation
- Security and compliance specifications
- DevOps and infrastructure planning
- Risk assessment and mitigation
- Full governance and audit trails`,
  ];

  return descriptions[level] ?? descriptions[2] ?? 'Standard Planning';
}
