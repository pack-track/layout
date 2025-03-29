import { Layout } from "./layout";
import { Monitor } from "./monitor";
import { PowerDistrict } from "./power-district/index";
import { Router } from "./router";
import { Section } from "./section";

export class District {
	children: District[] = [];

	powerDistricts: PowerDistrict[] = [];
	sections: Section[] = [];
	routers: Router[] = [];

	monitors: Monitor[] = [];

	constructor(
		public name: string,
		public parent: District | Layout
	) {}

	get domainName() {
		if (this.parent instanceof Layout) {
			return `${this.name}.${this.parent.name}`;
		}

		return `${this.name}.${this.parent.domainName}`;
	}
}
