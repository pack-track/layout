import { Channel } from "../device/channel";
import { Device } from "../device/index";

export class PowerDistrictMonitor {
	constructor(
		public device: Device,
		public channel: Channel
	) {}
}
