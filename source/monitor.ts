import { Device } from "./device/index";
import { District } from "./district";
import { Layout } from "./layout";

export class Monitor {
	constructor(
		public device: Device,
		public scope: District | Layout
	) { }
}
