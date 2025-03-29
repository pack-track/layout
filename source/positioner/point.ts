import { Positioner } from "./index";
import { Channel } from "../device/channel";
import { Track } from "../track";
import { ResponderType } from "./responder-type";

export class PointPositioner extends Positioner {
	constructor(
		public track: Track,
		public offset: number,
		public channel: Channel,
		public responder: ResponderType
	) {
		super();
	}

	get position() {
		return this.track.head.advance(this.offset);
	}
}
