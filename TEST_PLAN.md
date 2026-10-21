# OCMS V10 Acceptance Test Matrix

1. T-shirt demo: primary formula calculates each size and weighted average.
2. Component addition: neck rib appears separately and increases revised value only once.
3. Replacement component: excluded from automatic revised addition pending parent-panel mapping.
4. Tech-pack parser: detects Basic T-Shirt, 180 GSM, and maps BL/HC/SH/CBSL from demo.
5. Missing-input panel: appears after style selection.
6. Save in local mode: persists after browser refresh.
7. Supabase mode: signed-in user can create/read own calculations only.
8. Cross-user isolation: RLS prevents User A reading User B calculations.
9. CAD compare: variance and within-3%-target status display.
10. Approval: FINAL_APPROVED can be saved with approver and remarks.
11. Woven style: remains Pending until marker length + garments/marker are supplied.
12. No service-role key exists in frontend source.
