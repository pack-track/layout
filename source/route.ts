import { Router } from "./router";
import { Section } from "./section";

export class Route {
	in: Section;
	out: Section;

	constructor(
		public name: string,
		public router: Router,
	) {}
}
