import { District } from "./district";
import { Route } from "./route";

export class Router {
	activeRoute?: Route;

	routes: Route[] = [];

	constructor(
		public name: string,
		public district: District
	) {}

	get domainName() {
		return `${this.name}.${this.district.domainName}`;
	}
}
