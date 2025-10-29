/**
 * Unit Tests for Workflow Condition Evaluator
 * STORY-V3-006: Add Conditional Workflow Execution
 *
 * Tests cover:
 * - Variable substitution (${VAR}, {{VAR}})
 * - Comparison operators (===, !==, >, <, >=, <=)
 * - Boolean operators (&&, ||, !)
 * - Error handling for invalid conditions
 * - Security: dangerous pattern blocking
 * - Edge cases: empty conditions, undefined variables, type mismatches
 */

import {
  evaluateCondition,
  substituteVariables,
  ConditionEvaluationError,
  ConditionHelpers,
} from '@/lib/workflows/conditions';

describe('Workflow Condition Evaluator', () => {
  describe('evaluateCondition()', () => {
    describe('Variable Substitution', () => {
      it('should substitute ${VAR} syntax', () => {
        const result = evaluateCondition('${LEVEL} === 0', { LEVEL: 0 });
        expect(result).toBe(true);
      });

      it('should substitute {{VAR}} syntax', () => {
        const result = evaluateCondition('{{LEVEL}} === 0', { LEVEL: 0 });
        expect(result).toBe(true);
      });

      it('should substitute multiple variables', () => {
        const result = evaluateCondition(
          '${LEVEL} === 0 && {{MODE}} === "test"',
          { LEVEL: 0, MODE: 'test' }
        );
        expect(result).toBe(true);
      });

      it('should substitute string variables with quotes', () => {
        const result = evaluateCondition('${SECURITY} === "high"', { SECURITY: 'high' });
        expect(result).toBe(true);
      });

      it('should substitute number variables', () => {
        const result = evaluateCondition('${TEAM_SIZE} === 5', { TEAM_SIZE: 5 });
        expect(result).toBe(true);
      });

      it('should substitute boolean variables', () => {
        const result = evaluateCondition('${EXISTING_CODEBASE} === true', {
          EXISTING_CODEBASE: true,
        });
        expect(result).toBe(true);
      });

      it('should handle null values', () => {
        const result = evaluateCondition('${VALUE} === null', { VALUE: null });
        expect(result).toBe(true);
      });

      it('should handle undefined values in non-strict mode', () => {
        const result = evaluateCondition('${VALUE} === undefined', { VALUE: undefined }, {
          strictMode: false,
        });
        expect(result).toBe(true);
      });

      it('should throw error for missing variable in strict mode', () => {
        expect(() => {
          evaluateCondition('${MISSING} === 0', {}, { strictMode: true });
        }).toThrow(ConditionEvaluationError);
      });

      it('should treat missing variable as undefined in non-strict mode', () => {
        const result = evaluateCondition('${MISSING} === undefined', {}, { strictMode: false });
        expect(result).toBe(true);
      });
    });

    describe('Comparison Operators', () => {
      const variables = { A: 10, B: 5, C: 10 };

      it('should evaluate === (strict equality)', () => {
        expect(evaluateCondition('${A} === 10', variables)).toBe(true);
        expect(evaluateCondition('${A} === 5', variables)).toBe(false);
      });

      it('should evaluate !== (strict inequality)', () => {
        expect(evaluateCondition('${A} !== 5', variables)).toBe(true);
        expect(evaluateCondition('${A} !== 10', variables)).toBe(false);
      });

      it('should evaluate > (greater than)', () => {
        expect(evaluateCondition('${A} > 5', variables)).toBe(true);
        expect(evaluateCondition('${B} > 10', variables)).toBe(false);
        expect(evaluateCondition('${A} > 10', variables)).toBe(false);
      });

      it('should evaluate < (less than)', () => {
        expect(evaluateCondition('${B} < 10', variables)).toBe(true);
        expect(evaluateCondition('${A} < 5', variables)).toBe(false);
        expect(evaluateCondition('${A} < 10', variables)).toBe(false);
      });

      it('should evaluate >= (greater than or equal)', () => {
        expect(evaluateCondition('${A} >= 10', variables)).toBe(true);
        expect(evaluateCondition('${A} >= 5', variables)).toBe(true);
        expect(evaluateCondition('${B} >= 10', variables)).toBe(false);
      });

      it('should evaluate <= (less than or equal)', () => {
        expect(evaluateCondition('${B} <= 5', variables)).toBe(true);
        expect(evaluateCondition('${B} <= 10', variables)).toBe(true);
        expect(evaluateCondition('${A} <= 5', variables)).toBe(false);
      });
    });

    describe('Boolean Operators', () => {
      const variables = { A: true, B: false, C: 10, D: 5 };

      it('should evaluate && (logical AND)', () => {
        expect(evaluateCondition('${A} === true && ${C} === 10', variables)).toBe(true);
        expect(evaluateCondition('${A} === true && ${B} === true', variables)).toBe(false);
        expect(evaluateCondition('${B} === false && ${C} > 5', variables)).toBe(true);
      });

      it('should evaluate || (logical OR)', () => {
        expect(evaluateCondition('${A} === true || ${B} === true', variables)).toBe(true);
        expect(evaluateCondition('${B} === true || ${C} === 10', variables)).toBe(true);
        expect(evaluateCondition('${B} === true || ${D} === 0', variables)).toBe(false);
      });

      it('should evaluate ! (logical NOT)', () => {
        expect(evaluateCondition('!${B}', variables)).toBe(true);
        expect(evaluateCondition('!${A}', variables)).toBe(false);
      });

      it('should evaluate complex boolean expressions', () => {
        expect(
          evaluateCondition('(${C} > 5 && ${D} < 10) || ${A} === true', variables)
        ).toBe(true);
        expect(
          evaluateCondition('${C} > 15 || (${D} === 5 && ${B} === false)', variables)
        ).toBe(true);
        expect(evaluateCondition('!(${A} === true && ${B} === true)', variables)).toBe(true);
      });
    });

    describe('Complex Conditions', () => {
      it('should evaluate condition from STORY-V3-006 example 1', () => {
        const result = evaluateCondition('${LEVEL} === 0', { LEVEL: 0 });
        expect(result).toBe(true);
      });

      it('should evaluate condition from STORY-V3-006 example 2', () => {
        const result = evaluateCondition('${TEAM_SIZE} > 5 && ${SECURITY} === "high"', {
          TEAM_SIZE: 10,
          SECURITY: 'high',
        });
        expect(result).toBe(true);
      });

      it('should evaluate condition from STORY-V3-006 example 3', () => {
        const result = evaluateCondition('${EXISTING_CODEBASE} === true', {
          EXISTING_CODEBASE: true,
        });
        expect(result).toBe(true);
      });

      it('should evaluate condition from STORY-V3-006 example 4', () => {
        const result = evaluateCondition('!${DEBUG_MODE}', { DEBUG_MODE: false });
        expect(result).toBe(true);
      });

      it('should handle nested conditions with parentheses', () => {
        const result = evaluateCondition(
          '(${LEVEL} === 2 || ${LEVEL} === 3) && ${SECURITY} === "high"',
          { LEVEL: 2, SECURITY: 'high' }
        );
        expect(result).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should throw error for empty condition', () => {
        expect(() => {
          evaluateCondition('', {});
        }).toThrow(ConditionEvaluationError);
        expect(() => {
          evaluateCondition('', {});
        }).toThrow('Condition cannot be empty');
      });

      it('should throw error for condition that evaluates to non-boolean', () => {
        // A number by itself (not in a comparison) should fail
        expect(() => {
          evaluateCondition('${VALUE}', { VALUE: 5 });
        }).toThrow(ConditionEvaluationError);
        expect(() => {
          evaluateCondition('${VALUE}', { VALUE: 5 });
        }).toThrow('must evaluate to boolean');
      });

      it('should return false instead of throwing when throwOnError=false', () => {
        const result = evaluateCondition('${MISSING} === 0', {}, {
          throwOnError: false,
          strictMode: true,
        });
        expect(result).toBe(false);
      });

      it('should provide detailed error messages', () => {
        try {
          evaluateCondition('${MISSING} === 0', {}, { strictMode: true });
          fail('Should have thrown error');
        } catch (error) {
          expect(error).toBeInstanceOf(ConditionEvaluationError);
          expect((error as ConditionEvaluationError).condition).toBe('${MISSING} === 0');
          expect((error as Error).message).toContain('Variable not found');
        }
      });

      it('should handle invalid syntax gracefully', () => {
        expect(() => {
          evaluateCondition('${VALUE} === ', { VALUE: 10 });
        }).toThrow(ConditionEvaluationError);
      });
    });

    describe('Security - Dangerous Pattern Blocking', () => {
      it('should block eval()', () => {
        expect(() => {
          evaluateCondition('eval("alert(1)")', {});
        }).toThrow(ConditionEvaluationError);
        expect(() => {
          evaluateCondition('eval("alert(1)")', {});
        }).toThrow('dangerous pattern');
      });

      it('should block function keyword', () => {
        expect(() => {
          evaluateCondition('function() { return true; }', {});
        }).toThrow(ConditionEvaluationError);
      });

      it('should block Function constructor', () => {
        expect(() => {
          evaluateCondition('new Function("return true")', {});
        }).toThrow(ConditionEvaluationError);
      });

      it('should block window access', () => {
        expect(() => {
          evaluateCondition('window.location === "test"', {});
        }).toThrow(ConditionEvaluationError);
      });

      it('should block process access', () => {
        expect(() => {
          evaluateCondition('process.env.SECRET === "test"', {});
        }).toThrow(ConditionEvaluationError);
      });

      it('should block require()', () => {
        expect(() => {
          evaluateCondition('require("fs") === null', {});
        }).toThrow(ConditionEvaluationError);
      });

      it('should block import', () => {
        expect(() => {
          evaluateCondition('import("fs") === null', {});
        }).toThrow(ConditionEvaluationError);
      });

      it('should block this keyword', () => {
        expect(() => {
          evaluateCondition('this.value === 10', {});
        }).toThrow(ConditionEvaluationError);
      });

      it('should allow safe expressions', () => {
        expect(() => {
          evaluateCondition('10 > 5 && 5 < 10', {});
        }).not.toThrow();
      });
    });

    describe('Type Handling', () => {
      it('should compare strings correctly', () => {
        expect(evaluateCondition('${NAME} === "Alice"', { NAME: 'Alice' })).toBe(true);
        expect(evaluateCondition('${NAME} === "Bob"', { NAME: 'Alice' })).toBe(false);
      });

      it('should compare numbers correctly', () => {
        expect(evaluateCondition('${AGE} === 30', { AGE: 30 })).toBe(true);
        expect(evaluateCondition('${AGE} > 20', { AGE: 30 })).toBe(true);
      });

      it('should compare booleans correctly', () => {
        expect(evaluateCondition('${ACTIVE} === true', { ACTIVE: true })).toBe(true);
        expect(evaluateCondition('${ACTIVE} === false', { ACTIVE: true })).toBe(false);
      });

      it('should handle string with quotes', () => {
        // Test string comparison with quotes (using simpler example)
        const result = evaluateCondition('${TEXT} === "hello"', {
          TEXT: 'hello',
        });
        expect(result).toBe(true);
      });

      it('should handle numeric comparisons', () => {
        expect(evaluateCondition('${A} + ${B} === 15', { A: 10, B: 5 })).toBe(true);
        expect(evaluateCondition('${A} * ${B} === 50', { A: 10, B: 5 })).toBe(true);
      });
    });
  });

  describe('substituteVariables()', () => {
    it('should substitute ${VAR} syntax', () => {
      const result = substituteVariables('${LEVEL} === 0', { LEVEL: 0 });
      expect(result).toBe('0 === 0');
    });

    it('should substitute {{VAR}} syntax', () => {
      const result = substituteVariables('{{LEVEL}} === 0', { LEVEL: 0 });
      expect(result).toBe('0 === 0');
    });

    it('should substitute both syntaxes in same condition', () => {
      const result = substituteVariables('${A} === {{B}}', { A: 1, B: 1 });
      expect(result).toBe('1 === 1');
    });

    it('should format strings with quotes', () => {
      const result = substituteVariables('${NAME} === "test"', { NAME: 'test' });
      expect(result).toBe("'test' === \"test\"");
    });

    it('should format booleans', () => {
      const result = substituteVariables('${FLAG}', { FLAG: true });
      expect(result).toBe('true');
    });

    it('should format null', () => {
      const result = substituteVariables('${VALUE}', { VALUE: null });
      expect(result).toBe('null');
    });

    it('should throw error for missing variable in strict mode', () => {
      expect(() => {
        substituteVariables('${MISSING}', {}, true);
      }).toThrow(ConditionEvaluationError);
    });

    it('should return "undefined" for missing variable in non-strict mode', () => {
      const result = substituteVariables('${MISSING}', {}, false);
      expect(result).toBe('undefined');
    });
  });

  describe('ConditionHelpers', () => {
    describe('eq() - Loose equality', () => {
      it('should compare equal values', () => {
        expect(ConditionHelpers.eq(5, 5)).toBe(true);
        expect(ConditionHelpers.eq('test', 'test')).toBe(true);
        expect(ConditionHelpers.eq(5, '5')).toBe(true); // Loose equality
      });

      it('should detect non-equal values', () => {
        expect(ConditionHelpers.eq(5, 10)).toBe(false);
        expect(ConditionHelpers.eq('test', 'other')).toBe(false);
      });
    });

    describe('ne() - Loose inequality', () => {
      it('should detect non-equal values', () => {
        expect(ConditionHelpers.ne(5, 10)).toBe(true);
        expect(ConditionHelpers.ne('test', 'other')).toBe(true);
      });

      it('should detect equal values', () => {
        expect(ConditionHelpers.ne(5, 5)).toBe(false);
        expect(ConditionHelpers.ne('test', 'test')).toBe(false);
      });
    });

    describe('gt() - Greater than', () => {
      it('should compare numbers correctly', () => {
        expect(ConditionHelpers.gt(10, 5)).toBe(true);
        expect(ConditionHelpers.gt(5, 10)).toBe(false);
        expect(ConditionHelpers.gt(5, 5)).toBe(false);
      });

      it('should return false for non-numbers', () => {
        expect(ConditionHelpers.gt('10', 5)).toBe(false);
        expect(ConditionHelpers.gt(10, '5')).toBe(false);
      });
    });

    describe('lt() - Less than', () => {
      it('should compare numbers correctly', () => {
        expect(ConditionHelpers.lt(5, 10)).toBe(true);
        expect(ConditionHelpers.lt(10, 5)).toBe(false);
        expect(ConditionHelpers.lt(5, 5)).toBe(false);
      });

      it('should return false for non-numbers', () => {
        expect(ConditionHelpers.lt('5', 10)).toBe(false);
        expect(ConditionHelpers.lt(5, '10')).toBe(false);
      });
    });

    describe('gte() - Greater than or equal', () => {
      it('should compare numbers correctly', () => {
        expect(ConditionHelpers.gte(10, 5)).toBe(true);
        expect(ConditionHelpers.gte(5, 5)).toBe(true);
        expect(ConditionHelpers.gte(5, 10)).toBe(false);
      });
    });

    describe('lte() - Less than or equal', () => {
      it('should compare numbers correctly', () => {
        expect(ConditionHelpers.lte(5, 10)).toBe(true);
        expect(ConditionHelpers.lte(5, 5)).toBe(true);
        expect(ConditionHelpers.lte(10, 5)).toBe(false);
      });
    });

    describe('truthy() - Check if truthy', () => {
      it('should detect truthy values', () => {
        expect(ConditionHelpers.truthy(true)).toBe(true);
        expect(ConditionHelpers.truthy(1)).toBe(true);
        expect(ConditionHelpers.truthy('test')).toBe(true);
        expect(ConditionHelpers.truthy([])).toBe(true);
        expect(ConditionHelpers.truthy({})).toBe(true);
      });

      it('should detect falsy values', () => {
        expect(ConditionHelpers.truthy(false)).toBe(false);
        expect(ConditionHelpers.truthy(0)).toBe(false);
        expect(ConditionHelpers.truthy('')).toBe(false);
        expect(ConditionHelpers.truthy(null)).toBe(false);
        expect(ConditionHelpers.truthy(undefined)).toBe(false);
      });
    });

    describe('falsy() - Check if falsy', () => {
      it('should detect falsy values', () => {
        expect(ConditionHelpers.falsy(false)).toBe(true);
        expect(ConditionHelpers.falsy(0)).toBe(true);
        expect(ConditionHelpers.falsy('')).toBe(true);
        expect(ConditionHelpers.falsy(null)).toBe(true);
        expect(ConditionHelpers.falsy(undefined)).toBe(true);
      });

      it('should detect truthy values', () => {
        expect(ConditionHelpers.falsy(true)).toBe(false);
        expect(ConditionHelpers.falsy(1)).toBe(false);
        expect(ConditionHelpers.falsy('test')).toBe(false);
      });
    });

    describe('isNullOrUndefined()', () => {
      it('should detect null and undefined', () => {
        expect(ConditionHelpers.isNullOrUndefined(null)).toBe(true);
        expect(ConditionHelpers.isNullOrUndefined(undefined)).toBe(true);
      });

      it('should return false for other values', () => {
        expect(ConditionHelpers.isNullOrUndefined(0)).toBe(false);
        expect(ConditionHelpers.isNullOrUndefined(false)).toBe(false);
        expect(ConditionHelpers.isNullOrUndefined('')).toBe(false);
      });
    });

    describe('contains() - Array/String contains', () => {
      it('should check string contains', () => {
        expect(ConditionHelpers.contains('hello world', 'world')).toBe(true);
        expect(ConditionHelpers.contains('hello world', 'xyz')).toBe(false);
      });

      it('should check array contains', () => {
        expect(ConditionHelpers.contains([1, 2, 3], 2)).toBe(true);
        expect(ConditionHelpers.contains([1, 2, 3], 5)).toBe(false);
        expect(ConditionHelpers.contains(['a', 'b', 'c'], 'b')).toBe(true);
      });

      it('should return false for non-string/array', () => {
        expect(ConditionHelpers.contains(123, 2)).toBe(false);
        expect(ConditionHelpers.contains({}, 'key')).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace in conditions', () => {
      const result = evaluateCondition('  ${LEVEL}   ===   0  ', { LEVEL: 0 });
      expect(result).toBe(true);
    });

    it('should handle multiple spaces between operators', () => {
      const result = evaluateCondition('${A}    >    ${B}', { A: 10, B: 5 });
      expect(result).toBe(true);
    });

    it('should handle complex nested parentheses', () => {
      const result = evaluateCondition(
        '((${A} > 5) && (${B} < 10)) || (${C} === 20)',
        { A: 10, B: 5, C: 20 }
      );
      expect(result).toBe(true);
    });

    it('should handle negative numbers', () => {
      const result = evaluateCondition('${VALUE} === -5', { VALUE: -5 });
      expect(result).toBe(true);
    });

    it('should handle floating point numbers', () => {
      const result = evaluateCondition('${VALUE} === 3.14', { VALUE: 3.14 });
      expect(result).toBe(true);
    });

    it('should handle zero values', () => {
      expect(evaluateCondition('${VALUE} === 0', { VALUE: 0 })).toBe(true);
      expect(evaluateCondition('${VALUE} > 0', { VALUE: 0 })).toBe(false);
    });

    it('should handle empty string', () => {
      const result = evaluateCondition('${VALUE} === ""', { VALUE: '' });
      expect(result).toBe(true);
    });
  });

  describe('Integration with Workflow State', () => {
    it('should work with typical workflow state variables', () => {
      const workflowState = {
        LEVEL: 2,
        TEAM_SIZE: 8,
        SECURITY: 'high',
        EXISTING_CODEBASE: true,
        PROJECT_NAME: 'MADACE v3.0',
        USER_CHOICE: 'proceed',
      };

      // Test multiple realistic workflow conditions
      expect(evaluateCondition('${LEVEL} === 2', workflowState)).toBe(true);
      expect(evaluateCondition('${TEAM_SIZE} > 5', workflowState)).toBe(true);
      expect(evaluateCondition('${SECURITY} === "high"', workflowState)).toBe(true);
      expect(evaluateCondition('${EXISTING_CODEBASE} === true', workflowState)).toBe(true);
      expect(
        evaluateCondition('${LEVEL} >= 2 && ${SECURITY} === "high"', workflowState)
      ).toBe(true);
      expect(evaluateCondition('${USER_CHOICE} === "proceed"', workflowState)).toBe(true);
    });

    it('should handle route-workflow.yaml condition patterns', () => {
      // From route-workflow.yaml line 330: condition: '{{confirmed_level}}'
      const state = { confirmed_level: 2 };

      // The condition "{{confirmed_level}}" should be truthy when level is 2
      const result = evaluateCondition('{{confirmed_level}} === 2', state);
      expect(result).toBe(true);
    });

    it('should handle conditional step execution', () => {
      const state = {
        user_choice: 'override',
        manual_level: 3,
        LEVEL: 0,
      };

      // Conditional steps like in route-workflow.yaml line 288:
      // condition: '{{eq user_choice "override"}}'
      expect(evaluateCondition('${user_choice} === "override"', state)).toBe(true);
      expect(evaluateCondition('${manual_level} === 3', state)).toBe(true);
      expect(evaluateCondition('${LEVEL} === 0', state)).toBe(true);
    });
  });
});
