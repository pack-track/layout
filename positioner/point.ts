import { Positioner } from ".";
import { Channel } from "../source/device/channel";
import { Track } from "../source/track";
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
	
	dump() {
		console.group('Point positioner');
		console.log('offset:', this.offset);

		this.channel.dump();

		console.groupEnd();
	}
}