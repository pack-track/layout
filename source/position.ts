import { Section } from './section.js';

export class SectionPosition {
	constructor(
		public section: Section,
		public offset: number,
		public reversed: boolean
	) {
		if (offset > section.length || offset < 0) {
			throw new Error(`Offset ${offset} out of range for section '${section.domainName}' (0 - ${section.length})`);
		}
	}

	// returns the absolute position of the point inside the section
	// regardless of direction
	get absolutePosition() {
		if (this.reversed) {
			return this.section.length - this.offset;
		}

		return this.offset;
	}

	// TODO verify reverse
	advance(distance: number): SectionPosition {
		if (distance < 0) {
			return this.invert().advance(-distance).invert();
		}

		if (this.offset + distance > this.section.length) {
			const next = this.section.next(this.reversed);

			if (!next) {
				throw new Error(`Illegal advancement ${this} + ${distance}`);
			}

			return new SectionPosition(next, 0, this.reversed).advance(this.offset + distance - this.section.length);
		}

		return new SectionPosition(this.section, this.offset + distance, this.reversed);
	}

	// reverse direction
	private invert() {
		return new SectionPosition(this.section, this.section.length - this.offset, !this.reversed);
	}

	toString() {
		return `${this.section.name} @ ${this.offset.toFixed(1)} ${this.reversed ? 'backward' : 'forward'}`;
	}

	toPackTrackValue() {
		return `${this.section.domainName}@${this.offset}${this.reversed ? 'R' : 'F'}`;
	}
}
