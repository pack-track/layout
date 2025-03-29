import { Device } from "./device/index";
import { District } from "./district";
import { Layout } from "./layout";

export class Throttle {
	constructor(
		public device: Device,
		public scope: District | Layout
	) { }
}
