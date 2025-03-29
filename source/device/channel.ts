import { Device } from "./index";

export class Channel {
	constructor(
		public device: Device,
		public name: string
	) {}

	publish(data: any) {}

	toString() {
		return `${this.device.identifier}/${this.name}`;
	}
}
