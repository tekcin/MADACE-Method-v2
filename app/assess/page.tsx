'use client';

import { useState, useEffect } from 'react';
import { AssessmentForm } from '@/components/features/AssessmentForm';
import { AssessmentResult } from '@/components/features/AssessmentResult';
import { assessComplexity } from '@/lib/workflows/complexity-assessment';
import type { ProjectInput } from '@/lib/workflows/complexity-types';
import type { AssessmentResult as AssessmentResultType } from '@/lib/types/setup';

export default function AssessPage() {
  const [input, setInput] = useState<Partial<ProjectInput>>({});
  const [assessment, setAssessment] = useState<AssessmentResultType | null>(null);

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

  return (
    <main className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Project Complexity Assessment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Determine the recommended planning level for your project by answering 8 key questions
          </p>
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
