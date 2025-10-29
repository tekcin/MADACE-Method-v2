/**
 * Unit Tests for Route Workflow YAML
 *
 * STORY-V3-004: Validates the structure and completeness of route-workflow.yaml
 * Tests workflow structure, steps, routing paths, and YAML validity.
 *
 * @module __tests__/lib/workflows/route-workflow
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

describe('Route Workflow YAML (STORY-V3-004)', () => {
  const workflowPath = path.resolve(__dirname, '../../../workflows/route-workflow.yaml');
  let workflowData: any;

  beforeAll(async () => {
    const fileContent = await fs.readFile(workflowPath, 'utf-8');
    workflowData = yaml.load(fileContent);
  });

  describe('File Structure', () => {
    it('should exist at workflows/route-workflow.yaml', async () => {
      const fileExists = await fs
        .access(workflowPath)
        .then(() => true)
        .catch(() => false);

      expect(fileExists).toBe(true);
    });

    it('should be valid YAML', () => {
      expect(workflowData).toBeDefined();
      expect(typeof workflowData).toBe('object');
    });

    it('should have workflow root object', () => {
      expect(workflowData).toHaveProperty('workflow');
      expect(typeof workflowData.workflow).toBe('object');
    });
  });

  describe('Workflow Metadata', () => {
    it('should have correct name', () => {
      expect(workflowData.workflow.metadata.name).toBe('Scale-Adaptive Workflow Router');
    });

    it('should have version 3.0.0', () => {
      expect(workflowData.workflow.metadata.version).toBe('3.0.0');
    });

    it('should have description', () => {
      expect(workflowData.workflow.metadata.description).toContain('project complexity');
    });

    it('should reference EPIC-V3-001 and STORY-V3-004', () => {
      expect(workflowData.workflow.metadata.epic).toBe('EPIC-V3-001');
      expect(workflowData.workflow.metadata.story).toBe('STORY-V3-004');
    });
  });

  describe('Workflow Variables', () => {
    it('should define required variables', () => {
      const variables = workflowData.workflow.variables;

      expect(variables).toHaveProperty('project_info');
      expect(variables).toHaveProperty('complexity_assessment');
      expect(variables).toHaveProperty('assessment_report');
      expect(variables).toHaveProperty('confirmed_level');
      expect(variables).toHaveProperty('routing_decision');
    });
  });

  describe('Workflow Steps', () => {
    it('should have exactly 5 steps', () => {
      const steps = workflowData.workflow.steps;
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBe(5);
    });

    it('should have Step 1: Gather Project Information (elicit)', () => {
      const step1 = workflowData.workflow.steps[0];

      expect(step1.id).toBe('gather-project-info');
      expect(step1.name).toBe('Gather Project Information');
      expect(step1.action).toBe('elicit');
      expect(step1.output_var).toBe('project_info');
    });

    it('should have Step 2: Assess Complexity (assess_complexity)', () => {
      const step2 = workflowData.workflow.steps[1];

      expect(step2.id).toBe('assess-complexity');
      expect(step2.name).toBe('Assess Project Complexity');
      expect(step2.action).toBe('assess_complexity');
      expect(step2.output_var).toBe('complexity_assessment');
    });

    it('should have Step 3: Generate Assessment Report (render_template)', () => {
      const step3 = workflowData.workflow.steps[2];

      expect(step3.id).toBe('generate-assessment-report');
      expect(step3.name).toBe('Generate Assessment Report');
      expect(step3.action).toBe('render_template');
      expect(step3.template).toBe('scale-assessment.hbs');
      expect(step3.output_var).toBe('assessment_report');
    });

    it('should have Step 4: Confirm Planning Level (elicit)', () => {
      const step4 = workflowData.workflow.steps[3];

      expect(step4.id).toBe('confirm-planning-level');
      expect(step4.name).toBe('Confirm Planning Level');
      expect(step4.action).toBe('elicit');
      expect(step4.output_var).toBe('confirmed_level');
    });

    it('should have Step 5: Route to Workflow (route)', () => {
      const step5 = workflowData.workflow.steps[4];

      expect(step5.id).toBe('route-to-workflow');
      expect(step5.name).toBe('Route to Appropriate Workflow');
      expect(step5.action).toBe('route');
      expect(step5.output_var).toBe('routing_decision');
    });
  });

  describe('Step 1: Project Information Prompts', () => {
    let step1: any;

    beforeAll(() => {
      step1 = workflowData.workflow.steps[0];
    });

    it('should have 8 prompts (8 criteria)', () => {
      expect(step1.prompts).toBeDefined();
      expect(Array.isArray(step1.prompts)).toBe(true);
      expect(step1.prompts.length).toBe(8);
    });

    it('should have project_size prompt', () => {
      const prompt = step1.prompts.find((p: any) => p.id === 'project_size');
      expect(prompt).toBeDefined();
      expect(prompt.question).toContain('scale');
      expect(prompt.options.length).toBe(6); // 0-5 levels
    });

    it('should have team_size prompt', () => {
      const prompt = step1.prompts.find((p: any) => p.id === 'team_size');
      expect(prompt).toBeDefined();
      expect(prompt.question).toContain('developers');
      expect(prompt.options.length).toBe(6); // 0-5 levels
    });

    it('should have codebase_complexity prompt', () => {
      const prompt = step1.prompts.find((p: any) => p.id === 'codebase_complexity');
      expect(prompt).toBeDefined();
      expect(prompt.question).toContain('complexity');
    });

    it('should have integrations prompt', () => {
      const prompt = step1.prompts.find((p: any) => p.id === 'integrations');
      expect(prompt).toBeDefined();
      expect(prompt.question).toContain('external');
    });

    it('should have user_base prompt', () => {
      const prompt = step1.prompts.find((p: any) => p.id === 'user_base');
      expect(prompt).toBeDefined();
      expect(prompt.question).toContain('user base');
    });

    it('should have security prompt', () => {
      const prompt = step1.prompts.find((p: any) => p.id === 'security');
      expect(prompt).toBeDefined();
      expect(prompt.question).toContain('security');
    });

    it('should have duration prompt', () => {
      const prompt = step1.prompts.find((p: any) => p.id === 'duration');
      expect(prompt).toBeDefined();
      expect(prompt.question).toContain('duration');
    });

    it('should have existing_code prompt', () => {
      const prompt = step1.prompts.find((p: any) => p.id === 'existing_code');
      expect(prompt).toBeDefined();
      expect(prompt.question).toContain('existing code');
    });

    it('should have enum values 0-5 for each criterion', () => {
      step1.prompts.forEach((prompt: any) => {
        expect(prompt.options).toBeDefined();
        expect(prompt.options.length).toBe(6); // 0-5

        // Check values are 0-5
        const values = prompt.options.map((opt: any) => opt.value);
        expect(values).toEqual([0, 1, 2, 3, 4, 5]);
      });
    });
  });

  describe('Step 2: Assessment Algorithm Reference', () => {
    let step2: any;

    beforeAll(() => {
      step2 = workflowData.workflow.steps[1];
    });

    it('should reference complexity-assessment.ts algorithm', () => {
      expect(step2.algorithm).toContain('lib/workflows/complexity-assessment.ts');
      expect(step2.algorithm).toContain('assessComplexity');
    });

    it('should define output schema with ComplexityResult structure', () => {
      const schema = step2.output_schema;

      expect(schema).toHaveProperty('totalScore');
      expect(schema).toHaveProperty('level');
      expect(schema).toHaveProperty('breakdown');
      expect(schema).toHaveProperty('levelName');
      expect(schema).toHaveProperty('scoreRange');
      expect(schema).toHaveProperty('recommendedWorkflow');
      expect(schema).toHaveProperty('assessedAt');
    });

    it('should define breakdown with 8 criteria', () => {
      const breakdown = step2.output_schema.breakdown;

      expect(breakdown).toHaveProperty('projectSize');
      expect(breakdown).toHaveProperty('teamSize');
      expect(breakdown).toHaveProperty('codebaseComplexity');
      expect(breakdown).toHaveProperty('integrations');
      expect(breakdown).toHaveProperty('userBase');
      expect(breakdown).toHaveProperty('security');
      expect(breakdown).toHaveProperty('duration');
      expect(breakdown).toHaveProperty('existingCode');
    });
  });

  describe('Step 3: Template Rendering', () => {
    let step3: any;

    beforeAll(() => {
      step3 = workflowData.workflow.steps[2];
    });

    it('should reference scale-assessment.hbs template', () => {
      expect(step3.template).toBe('scale-assessment.hbs');
      expect(step3.template_path).toBe('templates/scale-assessment.hbs');
    });

    it('should pass ComplexityResult variables to template', () => {
      const vars = step3.vars;

      expect(vars).toBeDefined();
      expect(Object.keys(vars).length).toBeGreaterThanOrEqual(7);
    });

    it('should define output format as markdown', () => {
      expect(step3.output_format).toBe('markdown');
    });
  });

  describe('Step 4: Confirmation and Override', () => {
    let step4: any;

    beforeAll(() => {
      step4 = workflowData.workflow.steps[3];
    });

    it('should have 4 user choice options', () => {
      expect(step4.options).toBeDefined();
      expect(step4.options.length).toBe(4);

      const values = step4.options.map((opt: any) => opt.value);
      expect(values).toContain('proceed');
      expect(values).toContain('override');
      expect(values).toContain('view-report');
      expect(values).toContain('restart');
    });

    it('should have follow-up prompts for manual override', () => {
      expect(step4.follow_up).toBeDefined();
      expect(Array.isArray(step4.follow_up)).toBe(true);

      // Find override follow-up
      const overrideFollowUp = step4.follow_up.find((fu: any) => fu.condition.includes('override'));

      expect(overrideFollowUp).toBeDefined();
      expect(overrideFollowUp.prompts).toBeDefined();
      expect(overrideFollowUp.prompts.length).toBe(2); // manual_level + override_reason
    });

    it('should allow level selection 0-4 for override', () => {
      const overrideFollowUp = step4.follow_up.find((fu: any) => fu.condition.includes('override'));
      const levelPrompt = overrideFollowUp.prompts[0];

      expect(levelPrompt.id).toBe('manual_level');
      expect(levelPrompt.options.length).toBe(5); // Levels 0-4
    });
  });

  describe('Step 5: Routing Paths', () => {
    let step5: any;

    beforeAll(() => {
      step5 = workflowData.workflow.steps[4];
    });

    it('should have 5 routing paths (level_0 through level_4)', () => {
      const routing = step5.routing;

      expect(routing).toBeDefined();
      expect(routing).toHaveProperty('level_0');
      expect(routing).toHaveProperty('level_1');
      expect(routing).toHaveProperty('level_2');
      expect(routing).toHaveProperty('level_3');
      expect(routing).toHaveProperty('level_4');
    });

    it('should have Level 0 routing (Minimal)', () => {
      const level0 = step5.routing.level_0;

      expect(level0.label).toBe('Minimal Workflow Path');
      expect(level0.workflows).toEqual(['workflows/create-stories.workflow.yaml']);
    });

    it('should have Level 1 routing (Basic)', () => {
      const level1 = step5.routing.level_1;

      expect(level1.label).toBe('Basic Workflow Path');
      expect(level1.workflows.length).toBe(2);
      expect(level1.workflows).toContain('workflows/plan-project-light.workflow.yaml');
      expect(level1.workflows).toContain('workflows/create-stories.workflow.yaml');
    });

    it('should have Level 2 routing (Standard)', () => {
      const level2 = step5.routing.level_2;

      expect(level2.label).toBe('Standard Workflow Path');
      expect(level2.workflows.length).toBe(4);
      expect(level2.workflows).toContain('workflows/plan-project.workflow.yaml');
      expect(level2.workflows).toContain('workflows/create-architecture-basic.workflow.yaml');
      expect(level2.workflows).toContain('workflows/create-epics.workflow.yaml');
      expect(level2.workflows).toContain('workflows/create-stories.workflow.yaml');
    });

    it('should have Level 3 routing (Comprehensive)', () => {
      const level3 = step5.routing.level_3;

      expect(level3.label).toBe('Comprehensive Workflow Path');
      expect(level3.workflows.length).toBe(5);
      expect(level3.workflows).toContain('workflows/plan-project.workflow.yaml');
      expect(level3.workflows).toContain('workflows/create-tech-specs.workflow.yaml');
      expect(level3.workflows).toContain('workflows/create-architecture.workflow.yaml');
      expect(level3.workflows).toContain('workflows/create-epics.workflow.yaml');
      expect(level3.workflows).toContain('workflows/create-stories.workflow.yaml');
    });

    it('should have Level 4 routing (Enterprise)', () => {
      const level4 = step5.routing.level_4;

      expect(level4.label).toBe('Enterprise Workflow Path');
      expect(level4.workflows.length).toBe(7);
      expect(level4.workflows).toContain('workflows/plan-project.workflow.yaml');
      expect(level4.workflows).toContain('workflows/create-tech-specs.workflow.yaml');
      expect(level4.workflows).toContain('workflows/create-architecture.workflow.yaml');
      expect(level4.workflows).toContain('workflows/create-security-spec.workflow.yaml');
      expect(level4.workflows).toContain('workflows/create-devops-spec.workflow.yaml');
      expect(level4.workflows).toContain('workflows/create-epics.workflow.yaml');
      expect(level4.workflows).toContain('workflows/create-stories.workflow.yaml');
    });

    it('should have default fallback routing', () => {
      expect(step5.default).toBeDefined();
      expect(step5.default.workflows).toBeDefined();
      expect(step5.default.workflows.length).toBeGreaterThan(0);
    });

    it('should define sequential execution strategy', () => {
      const execution = step5.execution;

      expect(execution).toBeDefined();
      expect(execution.strategy).toBe('sequential');
      expect(execution.continue_on_error).toBe(false);
      expect(execution.track_progress).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should define error handling strategies', () => {
      const errorHandling = workflowData.workflow.error_handling;

      expect(Array.isArray(errorHandling)).toBe(true);
      expect(errorHandling.length).toBeGreaterThan(0);
    });

    it('should handle validation errors', () => {
      const errorHandling = workflowData.workflow.error_handling;
      const validationError = errorHandling.find((eh: any) => eh.condition === 'validation_error');

      expect(validationError).toBeDefined();
      expect(validationError.action).toBe('retry');
      expect(validationError.max_retries).toBe(3);
    });

    it('should handle workflow not found', () => {
      const errorHandling = workflowData.workflow.error_handling;
      const workflowNotFound = errorHandling.find(
        (eh: any) => eh.condition === 'workflow_not_found'
      );

      expect(workflowNotFound).toBeDefined();
      expect(workflowNotFound.action).toBe('fallback');
      expect(workflowNotFound.fallback_workflows).toBeDefined();
    });

    it('should handle user cancellation', () => {
      const errorHandling = workflowData.workflow.error_handling;
      const userCancelled = errorHandling.find((eh: any) => eh.condition === 'user_cancelled');

      expect(userCancelled).toBeDefined();
      expect(userCancelled.action).toBe('exit');
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should have lifecycle hooks defined', () => {
      const hooks = workflowData.workflow.hooks;

      expect(hooks).toBeDefined();
      expect(hooks).toHaveProperty('on_start');
      expect(hooks).toHaveProperty('on_complete');
      expect(hooks).toHaveProperty('on_error');
    });

    it('should validate environment on start', () => {
      const onStart = workflowData.workflow.hooks.on_start;

      expect(Array.isArray(onStart)).toBe(true);

      const validateEnv = onStart.find((hook: any) => hook.action === 'validate_environment');
      expect(validateEnv).toBeDefined();
      expect(validateEnv.checks).toBeDefined();
    });

    it('should save state on completion', () => {
      const onComplete = workflowData.workflow.hooks.on_complete;

      expect(Array.isArray(onComplete)).toBe(true);

      const saveState = onComplete.find((hook: any) => hook.action === 'save_state');
      expect(saveState).toBeDefined();
      expect(saveState.path).toBe('.scale-adaptive-route.state.json');
    });
  });

  describe('Acceptance Criteria Validation', () => {
    it('✅ should have workflows/route-workflow.yaml created', async () => {
      const fileExists = await fs
        .access(workflowPath)
        .then(() => true)
        .catch(() => false);

      expect(fileExists).toBe(true);
    });

    it('✅ should have Step 1: Elicit project information (8 questions)', () => {
      const step1 = workflowData.workflow.steps[0];

      expect(step1.action).toBe('elicit');
      expect(step1.prompts.length).toBe(8);
    });

    it('✅ should have Step 2: Assess complexity (call assessment algorithm)', () => {
      const step2 = workflowData.workflow.steps[1];

      expect(step2.action).toBe('assess_complexity');
      expect(step2.algorithm).toContain('assessComplexity');
    });

    it('✅ should have Step 3: Generate assessment report', () => {
      const step3 = workflowData.workflow.steps[2];

      expect(step3.action).toBe('render_template');
      expect(step3.template).toBe('scale-assessment.hbs');
    });

    it('✅ should have Step 4: Confirm planning level (with override option)', () => {
      const step4 = workflowData.workflow.steps[3];

      expect(step4.action).toBe('elicit');

      const overrideFollowUp = step4.follow_up.find((fu: any) => fu.condition.includes('override'));
      expect(overrideFollowUp).toBeDefined();
    });

    it('✅ should have Step 5: Route to appropriate workflow(s) based on level', () => {
      const step5 = workflowData.workflow.steps[4];

      expect(step5.action).toBe('route');
      expect(step5.routing).toBeDefined();
    });

    it('✅ should have 5 routing paths (one per level 0-4)', () => {
      const step5 = workflowData.workflow.steps[4];
      const routing = step5.routing;

      expect(routing).toHaveProperty('level_0');
      expect(routing).toHaveProperty('level_1');
      expect(routing).toHaveProperty('level_2');
      expect(routing).toHaveProperty('level_3');
      expect(routing).toHaveProperty('level_4');
    });

    it('✅ should be valid YAML (parseable)', () => {
      expect(workflowData).toBeDefined();
      expect(typeof workflowData).toBe('object');
      expect(workflowData.workflow).toBeDefined();
    });
  });
});
