export const BILLING = {
  page: {
    title: "Billing",
    subtitle: "Your plan, and what you've used of it.",
    workspaceLabel: "Workspace · {name}",
    manageSubscription: "Manage subscription",
    upgradeWorkspace: "Upgrade workspace",
    storage: "Workspace storage",
    usedOfLimit: "{used} of {limit}",
    usedNoLimit: "{used} — no limit",
  },
  loading: {
    plan: "Plan",
    usage: "Usage",
  },
  counts: {
    members: "one:{n} member|other:{n} members",
    paidSeats: "one:{n} paid seat|other:{n} paid seats",
    freeViewers: "one:{n} free viewer|other:{n} free viewers",
  },
  plan: {
    free: "Free",
    paid: "Paid",
    billedMonthly: "Billed monthly",
    billedYearly: "Billed yearly",
    freeSummary:
      "{members} · up to {recordings} recordings per person, {minutes} minutes each, data saver quality",
  },
  status: {
    onTrial: "Trial",
    active: "Active",
    paused: "Paused",
    pastDue: "Payment failed",
    unpaid: "Unpaid",
    cancelled: "Cancelled",
    expired: "Expired",
  },
  details: {
    youPay: "You pay",
    amountPerMonth: "{amount} a month",
    amountPerYear: "{amount} a year",
    seatsMonthly:
      "one:{n} seat × {price} a month|other:{n} seats × {price} a month",
    seatsYearly:
      "one:{n} seat × {price} a month, {total} a month billed yearly|other:{n} seats × {price} a month, {total} a month billed yearly",
    nextPayment: "Next payment",
    ends: "Ends",
    endOfPeriod: "At the end of this period",
    amountOnDate: "{amount} on {date}",
    firstPaymentPending: "When the first payment settles",
    estimate: "{base} · {change}, estimated",
    baseForSeats: "one:{amount} for {n} seat|other:{amount} for {n} seats",
    seatsAdded:
      "one:{amount} for {n} seat added this period|other:{amount} for {n} seats added this period",
    seatsRemoved:
      "one:{amount} credit for {n} seat removed this period|other:{amount} credit for {n} seats removed this period",
    seatChanges: "{amount} for seat changes this period",
    seats: "Seats",
    seatsAndViewers: "{seats}, {viewers}",
    billedTo: "Billed to",
    paymentMethod: "Payment method",
    cardEnding: "{brand} ending {last4}",
    card: "Card",
    updateCard: "Update",
  },
  switchPlan: {
    switchTo: "Switch to {plan}",
    title: "Switch to {plan}?",
    priceMonthly:
      "one:Your {n} seat go from {before} to {after} a month.|other:Your {n} seats go from {before} to {after} a month.",
    priceYearly:
      "one:Your {n} seat go from {before} to {after} a month, billed yearly.|other:Your {n} seats go from {before} to {after} a month, billed yearly.",
    benefits:
      "{plan} records at every quality up to 60 fps and adds AI editing.",
    timing:
      "It starts now. The difference for the rest of this billing period is added to your next invoice.",
    errors: {
      failed: "Couldn’t change the plan",
      unknownPlan: "Unknown plan",
      billingUnavailable: "Billing is unavailable",
      noSubscription: "This workspace has no active subscription",
      cancelled: "Resume the subscription before changing its plan",
      unavailable: "Plan changes aren't available right now",
      rejected: "Billing didn’t accept the change. Try again.",
    },
  },
  upgrade: {
    title: "Upgrade {name}",
    billingCycle: "Billing cycle",
    cycles: {
      monthly: "Monthly",
      annual: "Yearly",
    },
    annualSaving: "save {percent}%",
    seatPicker: {
      title: "Who gets a paid seat",
      selected: "{seats} of {total}",
      description:
        "Ticked people record and are billed. Everyone else is a free viewer who can watch, comment and react, but can't record. Roles change when you upgrade.",
      selectAll: "Select all",
      clear: "Clear",
      you: "(you)",
      paidSeat: "Paid seat",
      viewer: "Viewer",
    },
    perMonth: "per month",
    seatsPrice: "one:{n} seat × {price}|other:{n} seats × {price}",
    viewersFree: "one:{n} viewer free|other:{n} viewers free",
    priceWithViewers: "{seats}, {viewers}",
    priceYearly: "{seats}, billed yearly",
    priceWithViewersYearly: "{seats}, {viewers}, billed yearly",
    upgradeTo: "Upgrade to {plan}",
    checkoutUnavailable: "Checkout not configured",
  },
  requestSeat: {
    request: "Request to record",
    requested: "Seat requested",
    hint: "You’re a viewer here. Ask the owner for a paid seat so you can record.",
    requestedHint:
      "The owner has been asked. You’ll be able to record once they approve.",
    failed: "Couldn’t send the request",
  },
} as const;
