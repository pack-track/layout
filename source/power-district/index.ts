import { PowerDistrictActivator } from "./activator";
import { Device } from "../device/index";
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

	dump() {
		console.log(this.name);
	}
}
