import { RouteController } from "./route-controller";
import { Router } from "./router";
import { Section } from "./section";

export class Route {
	in: Section;
	out: Section;

	controllers: RouteController[] = [];

	constructor(
		public name: string,
		public router: Router,
	) {}
}
