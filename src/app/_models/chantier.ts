import { Task } from "./task";

export class Chantier {
  id: number;
  name: string;
  conductor: string;
  address: string;
  location: string;
  phone: string;
  details: string;
  tasks: Task[];
}