import { Device } from "./index";

export class Channel {
	constructor(
		public device: Device,
		public name: string
	) {}

	dump() {
		console.log(`Channel '${this.name}' on ${this.device.identifier}`);
	}

	publish(data: any) {}
}
