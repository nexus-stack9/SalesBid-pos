
export interface Vendor {
  id: number;
  name: string;
  email: string;
  contact: string;
  category: string;
  status: "active" | "inactive";
  joinDate: string;
}
