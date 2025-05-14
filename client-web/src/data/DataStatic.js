export const initialFilterData = {
  minPrice: 0,
  maxPrice: 0,
  places: [
    { id: "p001", label: "Da Lat", checked: false },
    { id: "p002", label: "Can Tho", checked: false },
    { id: "p003", label: "Ho Chi Minh", checked: false },
  ],
  durations: [
    { id: "d001", label: "3 Days", checked: false },
    { id: "d002", label: "4 Days", checked: false },
    { id: "d003", label: "5 Days", checked: false },
  ],
  sortOptions: [
    {id: "r001", label: "Recommended", checked: true},
    {id: "r002", label: "Price - Low to high", checked: false},
    {id: "r003", label: "Price - High to low", checked: false},
    {id: "r004", label: "Rating", checked: false},
  ]
};

export const commonRejectReasons = [
  "Incorrect refund information",
  "Invalid ticket",
  "Policy violation",
  "Insufficient funds",
  "Other"
];
