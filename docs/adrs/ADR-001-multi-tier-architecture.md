# ADR-001: Multi-Tier Architecture (Rust + Python + Next.js)

**Status:** ~~Accepted~~ **SUPERSEDED** by [ADR-003](./ADR-003-architecture-simplification.md)
**Date:** 2025-10-19
**Deciders:** MADACE Team
**Context:** Experimental implementation exploring MADACE concepts

> **⚠️ SUPERSEDED**: This ADR describes the **REJECTED multi-tier architecture**. The project has been simplified to **Next.js 14 Full-Stack TypeScript**. See [ADR-003](./ADR-003-architecture-simplification.md) for the current architecture decision.

---

## Context and Problem Statement

The official MADACE-METHOD is implemented in Node.js with a single-runtime architecture. This experimental project explores an alternative multi-tier architecture to:
1. Investigate performance characteristics of Rust for core business logic
2. Explore type safety benefits of Rust's ownership system
3. Research cross-language FFI (Foreign Function Interface) patterns
4. Validate if a web-based UI (vs. CLI) is viable for MADACE

**Question**: Should we build MADACE_RUST_PY as a 3-tier system (Rust+Python+Next.js) or follow the official Node.js pattern?

---

## Decision Drivers

- **Research Value**: Learning outcomes from multi-language architecture
- **Type Safety**: Rust's compile-time guarantees for business logic
- **Performance**: Potential performance benefits (unproven)
- **Complexity**: Cost of FFI vs. benefits
- **Maintainability**: Developer experience across 3 runtimes
- **Deployment**: Docker deployment complexity

---

## Considered Options

### Option 1: Multi-Tier (Rust + Python + Next.js) ⬅️ **CHOSEN**
```
Frontend (Next.js) → Backend (Python/FastAPI) → Core (Rust)
```

**Pros:**
- ✅ Strong type safety in business logic (Rust)
- ✅ Potential performance benefits
- ✅ Research value for architectural patterns
- ✅ Web UI accessible from any browser
- ✅ FastAPI excellent for async + OpenAPI docs
- ✅ Separation of concerns (clear boundaries)

**Cons:**
- ❌ FFI complexity (Rust ↔ Python)
- ❌ Three runtimes to manage
- ❌ Larger Docker images
- ❌ More complex build process
- ❌ Harder to debug across language boundaries
- ❌ No proven performance need

### Option 2: Pure Node.js (Like Official MADACE)
```
Frontend (Next.js) → Backend (Node.js) → Core (Node.js)
```

**Pros:**
- ✅ Single runtime (simpler)
- ✅ Proven to work (official MADACE)
- ✅ Easier debugging
- ✅ Smaller deployment footprint
- ✅ Faster development velocity

**Cons:**
- ❌ No research value (duplicates official)
- ❌ Less type safety
- ❌ Potential performance limitations (unproven)

### Option 3: Rust + Next.js (No Python Middle Layer)
```
Frontend (Next.js) → Core (Rust with web server)
```

**Pros:**
- ✅ Only 2 runtimes
- ✅ Direct Rust web server (using Actix/Axum)
- ✅ Fewer layers

**Cons:**
- ❌ Rust web frameworks less mature than FastAPI
- ❌ Harder LLM integration (Python ecosystem better)
- ❌ Still complex FFI (WebAssembly or HTTP)

---

## Decision Outcome

**Chosen Option**: **Option 1 - Multi-Tier (Rust + Python + Next.js)**

**Rationale:**
This is explicitly an **experimental research project**, not a production replacement for official MADACE. The multi-tier architecture maximizes learning outcomes even if it introduces complexity.

**Acceptance Criteria:**
- If FFI complexity becomes unmanageable → **Abandon Rust, revert to Node.js**
- If no performance benefit is measured → **Document findings, archive project**
- If architecture proves viable → **Publish findings for community**

---

## Decision Validation

### Success Metrics:
1. **FFI Boundary Works**: Can successfully call Rust from Python with <10% overhead
2. **Type Safety Proven**: Rust prevents bugs that would occur in JavaScript
3. **Performance Measurable**: Benchmark shows >2x improvement in core operations
4. **Development Velocity**: Can implement features in reasonable time despite complexity

### Failure Criteria (Abort Signals):
1. **FFI Debugging Hell**: Spending >50% of time debugging FFI issues
2. **No Measurable Benefit**: Performance same or worse than Node.js
3. **Build Complexity**: Build process becomes too fragile
4. **Community Disinterest**: No one cares about multi-language MADACE

---

## Consequences

### Positive:
- Unique research contribution to MADACE ecosystem
- Deep learning about FFI and cross-language architectures
- Potential performance wins if proven
- Demonstrates MADACE methodology is truly language-agnostic

### Negative:
- Higher maintenance burden
- Fewer potential contributors (need Rust + Python + JS skills)
- Longer development timeline
- Risk of project abandonment if complexity overwhelms value

### Neutral:
- Not competing with official MADACE (clearly experimental)
- Can pivot to Node.js if needed (documentation already exists)
- Learnings apply even if project is archived

---

## Implementation Notes

### Phase 1: Prove FFI (Critical Path)
```rust
// MUST work before building anything else:
#[pyfunction]
fn load_agent(path: String) -> PyResult<String> {
    // If this is painful, abort the architecture
}
```

**Milestone**: FFI proof-of-concept in Week 1

### Phase 2: Single Vertical Slice
Build ONE complete feature end-to-end:
```
UI → API → Rust → Back to UI
```

**Milestone**: Agent loading works through all 3 tiers by Week 2

### Phase 3: Evaluate
- Measure complexity vs. benefit
- Make GO/NO-GO decision on continuing
- If NO-GO: Pivot to Node.js, keep documentation

---

## Alternatives Considered (Future)

If this architecture proves too complex:

1. **Hybrid Approach**: Keep Rust for hot paths only, Node.js for everything else
2. **WASM Compilation**: Compile Rust to WebAssembly, run in Node.js
3. **Microservices**: Separate Rust core as independent service
4. **Full Rewrite**: Abandon multi-tier, implement in pure Node.js

---

## References

- Official MADACE: https://github.com/tekcin/MADACE-METHOD
- PyO3 Documentation: https://pyo3.rs
- Rust FFI Best Practices: https://doc.rust-lang.org/nomicon/ffi.html
- FastAPI Docs: https://fastapi.tiangolo.com

---

## Review and Update

**Next Review**: After completing first vertical slice (Week 2)
**Update Trigger**: Major architectural issues discovered
**Owner**: Architect Agent

---

**Decision Status**: ✅ **Accepted** (with explicit exit criteria)
