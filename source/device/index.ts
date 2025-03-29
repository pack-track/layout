import { Channel } from "./channel";

export class Device {
	channels: Channel[] = [];

	lastDiscovery: { date: Date, address: string };

	constructor(
		public identifier: string
	) {}
}
