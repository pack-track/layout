import { SectionPosition } from "./position";
import { Section } from "./section";

export class Span {
	constructor(
		public head: SectionPosition,
		public inside: Section[],
		public tail: SectionPosition
	) { }

	// TODO verify reverse
	contains(position: SectionPosition) {
		if (this.inside.includes(position.section)) {
			return true;
		}

		if (position.section == this.head.section) {
			if (this.head.reversed) {
				if (this.head.absolutePosition > position.absolutePosition) {
					return true;
				}
			} else {
				if (this.head.offset < position.absolutePosition) {
					return true;
				}
			}
		}

		if (position.section == this.tail.section) {
			if (this.tail.reversed) {
				if (this.tail.absolutePosition < position.absolutePosition) {
					return true;
				}
			} else {
				if (this.tail.offset > position.absolutePosition) {
					return true;
				}
			}
		}

		return false;
	}

	overlap(peer: Span) {
		return this.contains(peer.head) || this.contains(peer.tail);
	}

	get length() {
		// TODO verify reverse
		if (this.head.section == this.tail.section) {
			return Math.abs(this.head.offset - this.tail.offset);
		}

		let length = 0;

		if (this.head.reversed) {
			length += this.head.section.length - this.head.offset;
		} else {
			length += this.head.offset;
		}

		for (let section of this.inside) {
			length += section.length;
		}

		// TODO verify
		if (this.tail.reversed) {
			length += this.tail.offset;
		} else {
			length += this.tail.section.length - this.tail.offset;
		}

		return length;
	}

	// TODO verify reverse
	// TODO add efficient algo
	static trail(start: SectionPosition, end: SectionPosition) {
		let head = start;

		const sections = [];
		const increment = 1;

		while (head.section != end.section) {
			head = head.advance(increment);

			if (head.section != start.section && head.section != end.section && !sections.includes(head.section)) {
				sections.push(head.section);
			}
		}

		return new Span(start, sections, end);
	}
}
