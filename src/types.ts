export interface PlanFormData {
  city: string;
  occasion: string;
  vibes: string[];
  budget: string;
  dayTime: string;
  dietary: string;
  avoid: string;
  whoIsThisFor: string;
}

export interface TimelineStop {
  time: string;
  venueName: string;
  venueType: string;
  address: string;
  whyHere: string;
  mustOrder: string;
  pricePerPerson: string;
  bookingTip: string;
}

export interface DatePlan {
  title: string;
  vibeSummary: string;
  neighborhood: {
    name: string;
    whyThisNeighborhood: string;
  };
  timeline: TimelineStop[];
  backupOption: {
    venueName: string;
    venueType: string;
    address: string;
    whyItWorks: string;
  };
  dateTips: string[];
  totalCostEstimate: string;
  dressCode?: string;
}

export interface SavedPlan {
  id: string;
  title: string;
  city: string;
  occasion: string;
  dateSaved: string;
  plan: DatePlan;
  formData: PlanFormData;
}
