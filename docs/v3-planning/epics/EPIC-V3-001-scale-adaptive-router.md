# EPIC-V3-001: Scale-Adaptive Workflow Router

**Epic ID:** EPIC-V3-001  
**Epic Name:** Scale-Adaptive Workflow Router  
**Priority:** P0 (Critical)  
**Effort Estimate:** 34 points (3 weeks)  
**Target Quarter:** Q2 2026  
**Owner:** PM + Architect  
**Status:** 📋 Planning

---

## Epic Summary

Dynamic workflow routing system that assesses project complexity (Levels 0-4) and automatically selects appropriate planning workflows. Eliminates over-planning for simple projects and under-planning for complex systems.

**Key Innovation from BMAD v6:** Scale-Adaptive Workflow Engine™

---

## Problem Statement

**Current State (v2.0):**

- One-size-fits-all planning workflow
- Simple scripts get over-planned (unnecessary PRD, architecture docs)
- Complex systems get under-planned (missing tech specs, security docs)
- Users must manually decide documentation depth
- No guidance on appropriate planning level

**Pain Points:**

- Solo developer creating utility script: Spends 2 hours on PRD for 30-minute project
- Enterprise team building distributed system: Misses security spec, causes production issues
- New users: Don't know which documents to create
- PM agents: No criteria for determining project complexity

**Impact:**

- Wasted time on unnecessary documentation
- Missing critical documentation for complex projects
- Poor user experience for beginners
- Inconsistent planning quality

---

## Solution Overview

Implement **Scale-Adaptive Workflow Router** with:

1. **Complexity Assessment Algorithm** (8 criteria)
   - Project size, team size, codebase size, integrations
   - User base, security requirements, estimated duration
   - Scoring system: 0-40 points → Levels 0-4

2. **Dynamic Workflow Routing** (YAML-based)
   - Level 0: Direct to stories (no docs)
   - Level 1: Lightweight PRD + stories
   - Level 2: Standard PRD + architecture + stories
   - Level 3: Detailed PRD + epics + tech specs + architecture
   - Level 4: Comprehensive (+ security spec + DevOps spec)

3. **User Override System**
   - Manual level selection option
   - "Skip assessment" for experienced users
   - Level adjustment after assessment

4. **Assessment Report Generation**
   - Detailed scoring breakdown
   - Recommendations and rationale
   - Risk assessment per level
   - Output: `docs/scale-assessment.md`

---

## User Stories

### US-001: Simple Script Planning (Level 0)

**As a** solo developer creating a utility script  
**I want** to start coding immediately without documentation overhead  
**So that** I don't waste time on planning for a 30-minute project

**Acceptance Criteria:**

- Assessment determines Level 0 in <5 seconds
- Routes directly to story creation (no PRD, no architecture)
- Time from `madace plan` to first story: <5 minutes
- Assessment report still generated for record-keeping

---

### US-002: Enterprise System Planning (Level 4)

**As a** PM planning an enterprise distributed system  
**I want** comprehensive documentation including security and DevOps specs  
**So that** nothing critical is missed before implementation

**Acceptance Criteria:**

- Assessment detects enterprise characteristics (team size, security, integrations)
- Routes to Level 4 workflow (PRD + Epics + Tech Specs + Architecture + Security + DevOps)
- All documents generated within 2 hours
- Clear dependencies and sequencing

---

### US-003: Manual Override

**As an** experienced PM who knows my project needs  
**I want** to manually select the planning level  
**So that** I can override auto-detection when I disagree

**Acceptance Criteria:**

- CLI flag: `madace plan --level=2` skips assessment
- Web UI: Level selector dropdown with descriptions
- Override reason captured in assessment report
- System respects manual selection

---

### US-004: Assessment Report

**As a** team lead reviewing project planning  
**I want** to see detailed assessment reasoning  
**So that** I can validate the planning level is appropriate

**Acceptance Criteria:**

- Report shows all 8 criteria scores
- Clear explanation for each score
- Recommendations with rationale
- Risk assessment for chosen level
- Alternative levels suggested

---

## Technical Specifications

### Assessment Algorithm

**Complexity Criteria (8 factors):**

```typescript
interface ComplexityAssessment {
  projectSize: 'small' | 'medium' | 'large' | 'enterprise'; // 0-5 points
  teamSize: number; // 0-5 points
  existingCodebase: boolean; // +2 if true
  codebaseSize?: number; // 0-5 points
  integrationCount: number; // 0-5 points
  userBase: 'internal' | 'small' | 'medium' | 'large'; // 0-5 points
  securityRequirements: 'basic' | 'standard' | 'high' | 'critical'; // 0-5 points
  estimatedDuration: number; // 0-5 points
}

// Total: 0-40 points
// Level 0: 0-5 points
// Level 1: 6-12 points
// Level 2: 13-20 points
// Level 3: 21-30 points
// Level 4: 31-40 points
```

**Scoring Logic:**

```typescript
function assessComplexity(input: ProjectInput): ComplexityLevel {
  let score = 0;

  // Project size scoring
  score += projectSizeScore(input.projectSize);

  // Team size scoring
  score += teamSizeScore(input.teamSize);

  // Existing codebase bonus
  if (input.existingCodebase) score += 2;

  // Codebase size scoring
  if (input.codebaseSize) score += codebaseSizeScore(input.codebaseSize);

  // Integration count scoring
  score += integrationScore(input.integrationCount);

  // User base scoring
  score += userBaseScore(input.userBase);

  // Security requirements scoring
  score += securityScore(input.securityRequirements);

  // Duration scoring
  score += durationScore(input.estimatedDuration);

  return determineLevel(score);
}
```

### Workflow Routing YAML

```yaml
# workflows/route-workflow.yaml
workflow:
  name: 'Scale-Adaptive Workflow Router'
  description: 'Routes to appropriate planning workflow based on project complexity'
  version: '1.0.0'

  steps:
    - name: 'Gather Project Information'
      action: elicit
      prompts:
        - 'What type of project are you building?'
        - 'How many people are on your team?'
        - 'Is this a new project or existing codebase?'
        - 'How many external integrations (APIs, services)?'
        - 'What are your security requirements?'
        - 'Estimated project duration?'

    - name: 'Assess Project Complexity'
      action: assess_complexity
      input: '${PROJECT_INFO}'
      output_var: 'COMPLEXITY_LEVEL'

    - name: 'Generate Assessment Report'
      action: template
      template: 'scale-assessment.hbs'
      output: '${PROJECT_OUTPUT}/scale-assessment.md'
      vars:
        assessment: '${COMPLEXITY_ASSESSMENT}'
        level: '${COMPLEXITY_LEVEL}'
        recommendations: '${RECOMMENDATIONS}'

    - name: 'Confirm Planning Level'
      action: elicit
      prompt: |
        Based on your project characteristics, we recommend Level ${COMPLEXITY_LEVEL} planning.

        This includes: ${LEVEL_DOCS_LIST}

        Would you like to:
        1. Proceed with Level ${COMPLEXITY_LEVEL} (recommended)
        2. Choose a different level manually
        3. View assessment report details

    - name: 'Route to Appropriate Workflow'
      action: route
      condition: '${CONFIRMED_LEVEL}'
      routing:
        level_0:
          workflows: ['create-stories']
        level_1:
          workflows: ['plan-project-light', 'create-stories']
        level_2:
          workflows: ['plan-project', 'create-architecture-basic', 'create-epics', 'create-stories']
        level_3:
          workflows:
            [
              'plan-project',
              'create-tech-specs',
              'create-architecture',
              'create-epics',
              'create-stories',
            ]
        level_4:
          workflows:
            [
              'plan-project',
              'create-tech-specs',
              'create-architecture',
              'create-security-spec',
              'create-devops-spec',
              'create-epics',
              'create-stories',
            ]
```

### API Routes

```typescript
// app/api/workflows/assess-scale/route.ts
export async function POST(request: Request) {
  const input = await request.json();

  // Validate input
  const validated = ProjectInputSchema.parse(input);

  // Run assessment
  const assessment = assessComplexity(validated);

  // Generate report
  const report = await generateAssessmentReport(assessment);

  return NextResponse.json({
    level: assessment.level,
    score: assessment.score,
    recommendations: assessment.recommendations,
    reportPath: report.path,
  });
}
```

---

## Implementation Plan

### Phase 1: Assessment Algorithm (Week 1)

**Stories:**

- STORY-V3-001: Implement complexity scoring algorithm
- STORY-V3-002: Create assessment report template
- STORY-V3-003: Add unit tests for scoring logic

**Deliverables:**

- `lib/workflows/complexity-assessment.ts`
- `templates/scale-assessment.hbs`
- Test coverage: 90%+

---

### Phase 2: Workflow Routing (Week 2)

**Stories:**

- STORY-V3-004: Create route-workflow.yaml
- STORY-V3-005: Implement routing action in workflow executor
- STORY-V3-006: Add conditional workflow execution

**Deliverables:**

- `workflows/route-workflow.yaml`
- Enhanced workflow executor with routing support
- Integration tests for all 5 levels

---

### Phase 3: UI Integration (Week 3)

**Stories:**

- STORY-V3-007: Add CLI command `madace assess-scale`
- STORY-V3-008: Integrate assessment into setup wizard
- STORY-V3-009: Create Web UI assessment page
- STORY-V3-010: Add manual override functionality

**Deliverables:**

- CLI integration complete
- Web UI assessment widget
- User documentation and examples

---

## Success Metrics

### Performance Metrics

- **Assessment Speed:** <5 seconds per assessment
- **Level 0 Projects:** <5 min from start to first story
- **Level 4 Projects:** Complete documentation suite in <2 hours
- **API Response Time:** <200ms for assessment endpoint

### Adoption Metrics

- **User Satisfaction:** 90%+ feel workflows match project needs
- **Override Rate:** <10% (indicates accurate routing)
- **Assessment Usage:** 80%+ of projects run assessment
- **Level Distribution:**
  - Level 0: 20% of projects
  - Level 1: 30% of projects
  - Level 2: 30% of projects
  - Level 3: 15% of projects
  - Level 4: 5% of projects

### Quality Metrics

- **Documentation Completeness:** 95%+ of Level 4 projects have all required docs
- **Time Savings:** 50% reduction in planning time for Level 0-1 projects
- **Bug Rate:** <5 critical bugs in routing logic

---

## Dependencies

**Prerequisites:**

- None (foundational epic)

**Dependent Epics:**

- EPIC-V3-003 (JIT Tech Specs): Uses complexity level to determine when to generate specs
- EPIC-V3-007 (Enhanced Setup Wizard): Integrates assessment into wizard

**External Dependencies:**

- Workflow executor must support conditional routing (enhancement required)
- Template engine must support assessment report template

---

## Risks and Mitigation

### Risk 1: Assessment Accuracy

**Risk:** Algorithm doesn't accurately detect project complexity  
**Impact:** High (core feature value)  
**Likelihood:** Medium  
**Mitigation:**

- Extensive testing with diverse project types
- Beta testing with 50+ real projects
- User feedback loop for assessment quality
- Machine learning-based improvements (future)

### Risk 2: User Confusion

**Risk:** Users don't understand what each level means  
**Impact:** Medium  
**Likelihood:** Medium  
**Mitigation:**

- Clear descriptions and examples for each level
- Interactive tutorial in Web UI
- Assessment report explains reasoning
- Video tutorials demonstrating levels

### Risk 3: Workflow Complexity

**Risk:** Routing logic becomes too complex to maintain  
**Impact:** Low  
**Likelihood:** Low  
**Mitigation:**

- Keep routing simple (5 clear levels)
- Comprehensive test coverage
- Documentation of routing logic

---

## Testing Strategy

### Unit Tests

- Complexity scoring algorithm (all 8 criteria)
- Level determination logic (boundary cases)
- Assessment report generation
- Override functionality

### Integration Tests

- End-to-end workflow routing for all 5 levels
- CLI command integration
- API endpoint testing
- Web UI integration

### User Acceptance Testing

- 10 projects per level (50 total)
- Validate documentation completeness
- Measure time savings
- Collect user feedback

---

## Documentation Requirements

1. **User Guide:** "Understanding Scale-Adaptive Planning"
   - What each level means
   - When to override
   - Example projects for each level

2. **API Documentation:** Assessment endpoint specifications
3. **Developer Guide:** How to extend assessment criteria
4. **Video Tutorials:** "Choosing the Right Planning Level"

---

## Related Documents

- [PRD-V3.md](../PRD-V3.md) - Full v3.0 PRD
- [SCALE-ASSESSMENT.md](../SCALE-ASSESSMENT.md) - Example assessment report
- [ARCHITECTURE-V3-FUTURE.md](../../ARCHITECTURE-V3-FUTURE.md) - Section 5.1

---

**Epic Status:** 📋 Planning → Ready for Story Breakdown  
**Next Step:** Generate implementable stories (STORY-V3-001 through STORY-V3-010)  
**Assigned To:** PM + Architect (collaborative design)

---

**Last Updated:** 2025-10-24  
**Epic Owner:** PM Agent
