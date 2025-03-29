import { PowerDistrictActivator } from "./activator";
import { District } from "../district";
import { PowerDistrictMonitor } from "./monitor";
import { PowerDistrictReverser } from "./reverser";

export class PowerDistrict {
	activator?: PowerDistrictActivator;
	reverser?: PowerDistrictReverser;
	monitor?: PowerDistrictMonitor;

	constructor(
		public name: string,
		public district: District
	) {}

	get domainName() {
		return `${this.name}.${this.district.domainName}`;
	}
}
