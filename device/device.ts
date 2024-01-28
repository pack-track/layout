import { Channel } from "./channel";

export class Device {
	channels: Channel[] = [];

	lastDiscovery: { date: Date, address: string };
	
	constructor(
		public identifier: string
	) {}

	dump() {
		console.group(`Device ${this.identifier}`);

		if (this.lastDiscovery) {
			console.log(`last discovery: ${this.lastDiscovery.date.toISOString()} ${this.lastDiscovery.address}`);
		}

		console.group('channels');

		for (let channel of this.channels) {
			channel.dump();
		}

		console.groupEnd();
		console.groupEnd();
	}
}