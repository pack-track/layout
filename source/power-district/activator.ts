import { Channel } from "../device/channel";
import { Device } from "../device/index";

export class PowerDistrictActivator {
	constructor(
		public device: Device,
		public channel: Channel
	) {}
}
