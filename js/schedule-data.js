/* SoVi Living Lab — condensed schedule data for the Gantt view.
   THIS IS THE FILE YOU EDIT to update the schedule.
   Just change dates, names, or the critical flags below.

   Rules:
   - Dates are ISO format: "YYYY-MM-DD".
   - A normal work bar needs { name, start, end }.
   - A milestone (a diamond) needs { name, start, type:"milestone" }.
   - Add { key:true } to a milestone to draw it a little larger.
   - Add { critical:true } to mark an item on the critical path
     (it gets a soft red outline). Remove it and the item goes plain blue.

   This is a SUMMARY of the full ~95-line P6 schedule. The level-by-level
   repeats (precast L1-6, MEP rough-in L1-6, finishes L1-6) are rolled up
   into single bars on purpose, but every distinct system (sprinkler, fire
   alarm, elevators, generator, low voltage, etc.) is kept visible so the
   bars stay honest. Dates match the detailed schedule:
   Substantial Completion 05-Apr-29, Final Completion 17-May-29.

   This file MUST load before gantt.js. */

const SCHEDULE = {
  project: {
    name: "SoVi Building 6",
    dataDate: "2026-06-10",   // the dashed line on the chart
    rangeStart: "2026-06-01", // left edge of the timeline
    rangeEnd: "2029-07-01"    // right edge of the timeline
  },

  groups: [
    /* ---------------------------------------------------------------
       1. PRECONSTRUCTION & DESIGN
       RFQ through 100% CD. Design-build overlap is intentional, so the
       SD / DD / CD chain is the critical backbone; geotech and GMP ride
       alongside with float.
    --------------------------------------------------------------- */
    {
      name: "Preconstruction & Design",
      tasks: [
        { name: "Notice to Proceed", start: "2026-09-01", type: "milestone", critical: true },
        { name: "Preconstruction (RFQ to Program Validation)", start: "2026-06-10", end: "2026-12-17", critical: true },
        { name: "Geotechnical Investigation & Report", start: "2026-09-01", end: "2026-11-03" },
        { name: "Schematic Design", start: "2026-12-18", end: "2027-03-01", critical: true },
        { name: "Design Development", start: "2027-01-19", end: "2027-04-19", critical: true },
        { name: "GMP Established (60% CD)", start: "2027-06-22", type: "milestone" },
        { name: "Construction Documents & Permitting", start: "2027-03-02", end: "2027-08-18", critical: true },
        { name: "100% Construction Documents (IFC)", start: "2027-08-18", type: "milestone", critical: true }
      ]
    },

    /* ---------------------------------------------------------------
       2. PROCUREMENT (LONG-LEAD)
       Precast is the no.1 long-lead for this building (Metromont), shown
       as its own shop-drawing + fabrication chain. Other major equipment
       rolled into one delivery bar. All carries float.
    --------------------------------------------------------------- */
    {
      name: "Procurement (Long-Lead)",
      tasks: [
        { name: "Precast: Shop Drawings & Approval (Metromont)", start: "2027-06-23", end: "2027-08-26" },
        { name: "Precast: Fabrication & Delivery", start: "2027-08-27", end: "2028-01-06" },
        { name: "Major Equipment: Fab & Delivery (HVAC, Switchgear, Elevator, Generator)", start: "2027-06-23", end: "2028-04-05" }
      ]
    },

    /* ---------------------------------------------------------------
       3. SITEWORK, FOUNDATIONS & STRUCTURE
       Mobilize through topping out. Auger-cast piles (quiet, chosen for
       the adjacent occupied dorms) and the precast frame are critical.
    --------------------------------------------------------------- */
    {
      name: "Sitework, Foundations & Structure",
      tasks: [
        { name: "Begin Construction", start: "2027-08-19", type: "milestone", critical: true },
        { name: "Mobilization & Early Sitework", start: "2027-08-19", end: "2028-01-12", critical: true },
        { name: "Remote Parking Lots (Admin & Recreation)", start: "2027-10-01", end: "2028-02-09" },
        { name: "Auger-Cast Piles & Foundations", start: "2027-09-17", end: "2028-03-15", critical: true },
        { name: "CMU Stair & Elevator Cores", start: "2028-03-16", end: "2028-06-08" },
        { name: "Precast Structure & Hollow Core (L1 to Roof)", start: "2028-03-07", end: "2028-06-28", critical: true },
        { name: "Roofing System", start: "2028-06-29", end: "2028-07-27" }
      ]
    },

    /* ---------------------------------------------------------------
       4. BUILDING SYSTEMS & ENCLOSURE
       MEP rough-in is the critical thread feeding finishes. Every system
       (sprinkler, fire alarm, elevators, generator, low voltage) is a
       separate bar so nothing hides. Dry-in is a key gate milestone.
    --------------------------------------------------------------- */
    {
      name: "Building Systems & Enclosure",
      tasks: [
        { name: "Central Energy Plant Tie-in (Chilled Water)", start: "2028-01-13", end: "2028-02-23" },
        { name: "MEP Rough-in (Levels 1 to 6)", start: "2028-04-12", end: "2028-11-17", critical: true },
        { name: "Exterior Windows, Glazing & Doors", start: "2028-05-15", end: "2028-09-06" },
        { name: "Building Dry-In / Watertight", start: "2028-09-06", type: "milestone", key: true },
        { name: "Set HVAC & Electrical Equipment", start: "2028-03-16", end: "2028-08-24" },
        { name: "Fire Protection (Sprinkler & Alarm)", start: "2028-04-12", end: "2028-12-12" },
        { name: "Elevators (2 Cars): Install & Certify", start: "2028-06-29", end: "2028-11-17" },
        { name: "Generator & 72-hr Autonomy", start: "2028-07-28", end: "2028-10-06" },
        { name: "Low Voltage, Data & AV", start: "2028-04-26", end: "2029-01-25" },
        { name: "Building Enclosure Commissioning", start: "2028-09-07", end: "2028-10-11" }
      ]
    },

    /* ---------------------------------------------------------------
       5. INTERIOR FINISHES & FF&E
       Finishes (rolled up L1-6) are the critical run into closeout.
    --------------------------------------------------------------- */
    {
      name: "Interior Finishes & FF&E",
      tasks: [
        { name: "Interior Finishes (Levels 1 to 6)", start: "2028-05-24", end: "2029-02-15", critical: true },
        { name: "FF&E Installation (535 Beds)", start: "2028-10-30", end: "2029-02-08" },
        { name: "Signage & Wayfinding", start: "2028-10-30", end: "2028-12-05" }
      ]
    },

    /* ---------------------------------------------------------------
       6. COMMISSIONING & CLOSEOUT
       Functional testing, TCO, weather buffer, then Substantial
       Completion. Punch / warranties / O&M / LEED run to Final.
    --------------------------------------------------------------- */
    {
      name: "Commissioning & Closeout",
      tasks: [
        { name: "Commissioning & Functional Testing", start: "2028-12-13", end: "2029-02-08" },
        { name: "Inspections & TCO", start: "2029-02-09", end: "2029-03-08" },
        { name: "LEED Documentation & Certification", start: "2029-02-09", end: "2029-05-03" },
        { name: "Final Cleaning", start: "2029-02-16", end: "2029-03-08" },
        { name: "Weather / Hurricane Contingency", start: "2029-03-09", end: "2029-04-05", critical: true },
        { name: "Substantial Completion", start: "2029-04-05", type: "milestone", key: true, critical: true },
        { name: "Punch List", start: "2029-03-15", end: "2029-04-25" },
        { name: "Closeout (Warranties, O&M & Training)", start: "2029-04-06", end: "2029-05-17", critical: true },
        { name: "Final Completion", start: "2029-05-17", type: "milestone", key: true, critical: true }
      ]
    }
  ]
};