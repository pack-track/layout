import { Device } from "./device";
import { District } from "./district";
import { Layout } from "./layout";

export class Monitor {
	constructor(
		public device: Device,
		public scope: District | Layout
	) { }

	dump() {
		console.group('Monitor');
		console.log('scope:', this.scope instanceof Layout ? '*' : this.scope.domainName);

		this.device.dump();

		console.groupEnd();
	}
}
