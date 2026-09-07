// =========================================================
// iRacing Setup Engine — Knowledge Base & Recommendation Logic
// =========================================================

// ---- OVAL / STOCK CAR KNOWLEDGE BASE --------------------

const ovalRecommendations = {
  loose: {
    entry: {
      description: "Car rotates too early or snaps on turn-in",
      fixes: [
        { category: "Brakes", adjustment: "Increase front brake bias (+1–2%)", why: "More front bias slows the nose relative to the rear on entry" },
        { category: "Springs (Rear)", adjustment: "Stiffen rear springs (+10–20 lb/in)", why: "A stiffer rear resists squat and reduces rotation on entry" },
        { category: "Crossweight / Wedge", adjustment: "Add wedge (+0.5–1%)", why: "More right-rear weight increases rear grip on entry" },
        { category: "Shocks (Rear)", adjustment: "Increase rear rebound (compression stays)", why: "More rebound keeps the rear planted longer on corner entry" },
        { category: "Sway Bar (Rear)", adjustment: "Stiffen rear sway bar or increase rear ARB", why: "Limits rear roll and reduces oversteer tendency on entry" },
        { category: "Tire Pressures (Rear)", adjustment: "Raise left-rear pressure (+0.5–1 psi)", why: "Slightly more pressure on LR increases rear lateral stiffness" }
      ]
    },
    center: {
      description: "Car won't track straight through the apex — rear slides",
      fixes: [
        { category: "Rear Ride Height", adjustment: "Raise rear ride height (+1/8 in)", why: "Higher rear CG shifts weight rearward and increases rear mechanical grip" },
        { category: "Sway Bar (Rear)", adjustment: "Stiffen rear sway bar", why: "Reduces mid-corner roll and keeps rear planted" },
        { category: "Crossweight / Wedge", adjustment: "Add wedge (+0.5%)", why: "More right-rear load improves mid-corner rear traction" },
        { category: "Springs (Rear)", adjustment: "Stiffen right-rear spring (+10 lb/in)", why: "Reduces RR compression mid-corner which stabilizes the rear" },
        { category: "Shocks (Rear)", adjustment: "Increase rear rebound damping", why: "Slows weight transfer back to the rear for a more stable mid-corner" }
      ]
    },
    exit: {
      description: "Car spins or slides when getting back to throttle",
      fixes: [
        { category: "Springs (Rear)", adjustment: "Stiffen rear springs (+10–20 lb/in)", why: "Limits squat on acceleration, reducing rear-end step-out" },
        { category: "Rear Ride Height", adjustment: "Lower rear ride height (−1/8 in)", why: "Lowers CG and reduces rear roll moment on exit" },
        { category: "Crossweight / Wedge", adjustment: "Add wedge (+0.5–1%)", why: "More right-rear load gives the RR tire more exit traction" },
        { category: "Throttle Map", adjustment: "Use a softer throttle map if available", why: "Reduces snap oversteer from sudden power application" },
        { category: "Shocks (Rear)", adjustment: "Increase rear compression damping", why: "Slows squat rate on throttle and keeps rear grip stable" }
      ]
    }
  },
  tight: {
    entry: {
      description: "Car won't rotate — front pushes through turn-in",
      fixes: [
        { category: "Brakes", adjustment: "Decrease front brake bias (−1–2%)", why: "Less front bias allows the nose to rotate more freely on entry" },
        { category: "Springs (Front)", adjustment: "Soften front springs (−10–20 lb/in)", why: "More front compliance increases front mechanical grip on entry" },
        { category: "Crossweight / Wedge", adjustment: "Remove wedge (−0.5–1%)", why: "Less right-rear load shifts lateral grip to the front" },
        { category: "Front Ride Height", adjustment: "Lower front ride height (−1/8 in)", why: "Lower front increases front downforce and aero grip on entry" },
        { category: "Shocks (Front)", adjustment: "Reduce front rebound damping", why: "Allows the front end to settle faster on corner entry" }
      ]
    },
    center: {
      description: "Car won't turn at the apex — front plows straight",
      fixes: [
        { category: "Front Ride Height", adjustment: "Lower front ride height (−1/8 in)", why: "Increases front aero grip and lowers front CG" },
        { category: "Sway Bar (Front)", adjustment: "Soften front sway bar", why: "Allows more front roll which loads the outside front tire" },
        { category: "Springs (Front)", adjustment: "Soften left-front spring (−10 lb/in)", why: "More LF compression allows the tire to work better mid-corner" },
        { category: "Crossweight / Wedge", adjustment: "Remove wedge (−0.5%)", why: "Less RR load moves more grip to the front axle" },
        { category: "Tire Pressures (Front)", adjustment: "Reduce left-front pressure (−0.5 psi)", why: "Slightly lower LF pressure increases contact patch size" }
      ]
    },
    exit: {
      description: "Car understeers on throttle — won't rotate under power",
      fixes: [
        { category: "Springs (Rear)", adjustment: "Soften rear springs (−10–20 lb/in)", why: "More rear squat on throttle transfers load rearward which helps rotation" },
        { category: "Crossweight / Wedge", adjustment: "Remove wedge (−0.5%)", why: "Less right-rear load reduces rear grip relative to front" },
        { category: "Rear Ride Height", adjustment: "Raise rear ride height (+1/8 in)", why: "Raises rear CG and promotes more weight transfer for exit rotation" },
        { category: "Sway Bar (Front)", adjustment: "Stiffen front sway bar", why: "More front resistance creates more understeer on exit — do this if overshoot is the concern" }
      ]
    }
  }
};

// ---- GT / SPORTS CAR KNOWLEDGE BASE ---------------------

const gtRecommendations = {
  oversteer: {
    entry: {
      description: "Rear steps out before or during turn-in",
      fixes: [
        { category: "Springs (Front)", adjustment: "Stiffen front springs (+5–10 N/mm)", why: "A stiffer front resists compression on entry, shifting load balance rearward" },
        { category: "Anti-Roll Bar (Rear)", adjustment: "Soften rear ARB", why: "Less rear roll stiffness reduces lateral load transfer at the rear" },
        { category: "Brakes", adjustment: "Increase front brake bias (+1–2%)", why: "More front bias slows the nose without upsetting the rear" },
        { category: "Differential", adjustment: "Reduce entry (lift-off) diff locking", why: "Less diff lock on entry allows rear wheels to rotate independently, reducing rotation snap" },
        { category: "Rear Ride Height", adjustment: "Raise rear ride height (+1–2 mm)", why: "More rear rake increases rear downforce and adds mechanical grip" },
        { category: "Rear Downforce", adjustment: "Increase rear wing angle (+1–2°)", why: "More rear aero load reduces rotation tendency" }
      ]
    },
    midcorner: {
      description: "Rear slides at the apex under constant speed",
      fixes: [
        { category: "Anti-Roll Bar (Rear)", adjustment: "Stiffen rear ARB", why: "More rear roll resistance limits how much the rear rolls and slides" },
        { category: "Springs (Rear)", adjustment: "Stiffen rear springs (+5 N/mm)", why: "Reduces rear roll and keeps the rear settled through the apex" },
        { category: "Rear Downforce", adjustment: "Increase rear wing angle (+1–2°)", why: "More rear grip from aero at medium to high speed corners" },
        { category: "Tire Pressures (Rear)", adjustment: "Adjust rear pressures toward optimal target", why: "Incorrect pressures cause overheating and grip loss" },
        { category: "Camber (Rear)", adjustment: "Increase rear negative camber (−0.1 to −0.3°)", why: "More camber keeps the outer tire flatter in the contact patch" }
      ]
    },
    exit: {
      description: "Rear snaps out on throttle application",
      fixes: [
        { category: "Differential", adjustment: "Increase exit (power-on) diff locking", why: "More diff lock ties the rear wheels together and reduces wheelspin-induced rotation" },
        { category: "Springs (Rear)", adjustment: "Stiffen rear springs (+5–10 N/mm)", why: "Limits squat and rear roll on throttle" },
        { category: "Rear Downforce", adjustment: "Increase rear wing angle (+1–2°)", why: "More rear aero grip helps stability on exit" },
        { category: "Anti-Roll Bar (Rear)", adjustment: "Stiffen rear ARB", why: "More rear stiffness reduces exit rotation" },
        { category: "Throttle Map", adjustment: "Use softer throttle map or lift slightly later", why: "Reduces the sharpness of power delivery that triggers snap" }
      ]
    }
  },
  understeer: {
    entry: {
      description: "Front plows on corner entry — car won't turn in",
      fixes: [
        { category: "Springs (Front)", adjustment: "Soften front springs (−5–10 N/mm)", why: "More front compliance increases front grip and turn-in response" },
        { category: "Anti-Roll Bar (Front)", adjustment: "Soften front ARB", why: "Less front roll stiffness allows more mechanical front grip" },
        { category: "Brakes", adjustment: "Decrease front brake bias (−1–2%)", why: "Less front lock-up tendency allows front tires to generate lateral grip sooner" },
        { category: "Front Ride Height", adjustment: "Lower front ride height (−1–2 mm)", why: "Increases front downforce and reduces front aero push" },
        { category: "Front Downforce", adjustment: "Increase front wing angle (+1°)", why: "More front aero grip aids high-speed turn-in" },
        { category: "Toe (Front)", adjustment: "Reduce front toe-out or add slight toe-in", why: "Toe adjustments affect turn-in sharpness" }
      ]
    },
    midcorner: {
      description: "Car runs wide through the apex — won't hold the line",
      fixes: [
        { category: "Anti-Roll Bar (Front)", adjustment: "Soften front ARB", why: "Allows outside front to load up more and generate more grip" },
        { category: "Front Downforce", adjustment: "Increase front wing angle (+1–2°)", why: "More front grip helps hold the line at medium and high speeds" },
        { category: "Camber (Front)", adjustment: "Increase front negative camber (−0.1 to −0.3°)", why: "More camber improves contact patch in corners" },
        { category: "Tire Pressures (Front)", adjustment: "Adjust front pressures toward optimal target", why: "Overinflated fronts cause a smaller contact patch and less grip" },
        { category: "Springs (Front)", adjustment: "Soften front springs (−5 N/mm)", why: "Allows more front compliance through sustained cornering" }
      ]
    },
    exit: {
      description: "Car understeers when getting back on throttle",
      fixes: [
        { category: "Differential", adjustment: "Reduce exit (power-on) diff locking", why: "Less locking allows inside rear to spin slightly, aiding rotation" },
        { category: "Anti-Roll Bar (Rear)", adjustment: "Soften rear ARB", why: "Reduces rear stiffness so the rear pivots more freely on exit" },
        { category: "Springs (Rear)", adjustment: "Soften rear springs (−5 N/mm)", why: "More rear compliance shifts weight to the rear on throttle, helping rotation" },
        { category: "Rear Ride Height", adjustment: "Lower rear ride height (−1 mm)", why: "Reduces rear downforce slightly, trimming rear traction for balance" },
        { category: "Throttle Map", adjustment: "Apply throttle earlier and more progressively", why: "Smooth power application while still in yaw angle aids exit rotation" }
      ]
    }
  }
};

// ---- Severity Multipliers ---------------------------------
// Used to label the priority of each fix based on how bad the problem is.

const severityLabels = {
  slight:   { label: "Minor",    count: 2 },
  moderate: { label: "Moderate", count: 3 },
  severe:   { label: "Severe",   count: 5 }
};

// ---- Main Recommendation Function ------------------------

/**
 * Generate setup recommendations.
 *
 * @param {object} params
 * @param {string} params.carType    - "oval" | "gt"
 * @param {string} params.balance    - Oval: "loose"|"tight" / GT: "oversteer"|"understeer"
 * @param {string} params.zone       - Oval: "entry"|"center"|"exit" / GT: "entry"|"midcorner"|"exit"
 * @param {string} params.severity   - "slight"|"moderate"|"severe"
 * @param {string} [params.carName]  - Free-text car name for display
 * @param {string} [params.trackName]- Free-text track name for display
 * @param {string} [params.notes]    - Additional driver notes
 * @returns {object} Recommendation result
 */
function generateRecommendations(params) {
  const { carType, balance, zone, severity, carName, trackName, notes } = params;

  let knowledgeBase, symptomKey;

  if (carType === "oval") {
    knowledgeBase = ovalRecommendations;
    symptomKey = balance; // "loose" or "tight"
  } else {
    knowledgeBase = gtRecommendations;
    symptomKey = balance; // "oversteer" or "understeer"
  }

  const symptomData = knowledgeBase?.[symptomKey]?.[zone];
  if (!symptomData) {
    return { error: "No recommendations found for that combination." };
  }

  const sevInfo = severityLabels[severity] || severityLabels.moderate;
  const topFixes = symptomData.fixes.slice(0, sevInfo.count);

  return {
    carName: carName || "Unknown Car",
    trackName: trackName || "Unknown Track",
    carType,
    balance,
    zone,
    severity: sevInfo.label,
    description: symptomData.description,
    fixes: topFixes,
    notes: notes || "",
    generatedAt: new Date().toISOString()
  };
}

// ---- Helper: Car Type Lists ------------------------------

const carOptions = {
  oval: [
    "NASCAR Cup Series",
    "NASCAR Xfinity Series",
    "NASCAR Truck Series",
    "Late Model Stock",
    "Super Late Model",
    "Legends Car",
    "Street Stock",
    "SK Modified",
    "Dirt Late Model",
    "Dirt Modified",
    "Sprint Car",
    "Big Block Modified",
    "Other Oval"
  ],
  gt: [
    "GTP (LMDh / Hypercar)",
    "LMP2",
    "GT3",
    "GT4",
    "Porsche Cup",
    "Ferrari GT3",
    "Lamborghini GT3",
    "BMW M4 GT3",
    "Mercedes AMG GT3",
    "Audi R8 GT3",
    "McLaren 720S GT3",
    "Ford Mustang GT3",
    "Dallara P217 (LMP2)",
    "Other GT / Sports Car"
  ]
};

// Export for use in app.js
if (typeof module !== "undefined") {
  module.exports = { generateRecommendations, carOptions, ovalRecommendations, gtRecommendations };
}
