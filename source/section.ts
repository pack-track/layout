import { District } from "./district";
import { SectionPosition } from "./position";
import { PowerDistrict } from "./power-district/index";
import { Router } from "./router";
import { Span } from "./span";
import { Tile } from "./tile";
import { Track } from "./track";

export class Section {
	powerDistrict: PowerDistrict;

	tracks: Track[] = [];
	tiles: Tile[] = [];

	in?: Router | Section;
	out?: Router | Section;

	constructor(
		public name: string,
		public district: District
	) {}

	get domainName() {
		return `${this.name}.${this.district.domainName}`;
	}

	// returns the next currently set section
	next(reverse: boolean) {
		if (reverse) {
			if (!this.in) {
				return null;
			}

			if (this.in instanceof Section) {
				return this.in;
			}

			if (this.in instanceof Router) {
				const activeRoute = this.in.activeRoute;

				if (!activeRoute) {
					throw new Error(`Router '${this.in.domainName}' has no active route`);
				}

				if (activeRoute.in == this) {
					return activeRoute.out;
				}

				if (activeRoute.out == this) {
					return activeRoute.in;
				}

				throw new Error(`Router '${this.in.domainName}' is not routing from '${this.domainName}'`);
			}
		} else {
			if (!this.out) {
				return null;
			}

			if (this.out instanceof Section) {
				return this.out;
			}

			if (this.out instanceof Router) {
				const activeRoute = this.out.activeRoute;

				if (!activeRoute) {
					throw new Error(`Router '${this.out.domainName}' has no active route`);
				}

				if (activeRoute.in == this) {
					return activeRoute.out;
				}

				if (activeRoute.out == this) {
					return activeRoute.in;
				}

				throw new Error(`Router '${this.in?.domainName}' is not routing from '${this.domainName}'`);
			}
		}
	}

	// TODO verifiy reverse
	getTilesInRange(startPosition: SectionPosition, endPosition: SectionPosition) {
		const span = Span.trail(startPosition, endPosition);

		const tiles: Tile[] = [];
		let sectionLength = 0;

		if (startPosition.section == endPosition.section) {
			sectionLength = startPosition.section.length;
			tiles.push(...startPosition.section.tiles);
		} else {
			sectionLength += startPosition.section.length;
			tiles.push(...startPosition.section.tiles);

			for (let inside of span.inside) {
				sectionLength += inside.length;
				tiles.push(...inside.tiles);
			}

			sectionLength += endPosition.section.length;
			tiles.push(...endPosition.section.tiles);
		}

		let tileLength = 0;

		for (let tile of tiles) {
			tileLength += tile.pattern.length;
		}

		const start = tileLength / sectionLength * startPosition.absolutePosition;
		const end = tileLength - tileLength / sectionLength * (endPosition.section.length - endPosition.absolutePosition);

		return {
			offset: { start, end },
			tiles
		};
	}

	get length() {
		return this.tracks.reduce((accumulator, track) => accumulator + track.length, 0);
	}

	get tileLength() {
		return this.tiles.reduce((accumulator, tile) => accumulator + tile.pattern.length, 0);
	}

	// follow the active path ahead (reverse = true = back)
	// uses the currently set routes
	// returns all touched sections
	trail(offset: number, reversed: boolean, length: number) {
		let tip: Section = this;
		const sections: Section[] = [this];

		if (reversed) {
			length -= offset;
		} else {
			length -= this.length - offset;
		}

		while (length > 0) {
			let next: Router | Section | undefined;

			if (reversed) {
				next = tip.in;
			} else {
				next = tip.out;
			}

			if (!next) {
				return {
					sections,

					tip: new SectionPosition(tip, tip.length, false)
				};
			}

			if (next instanceof Section) {
				tip = next;
			}

			if (next instanceof Router) {
				if (!next.activeRoute) {
					throw new Error(`Router '${next.domainName}' has no active route (routes: ${next.routes.map(route => `'${route.name}'`).join(', ')})`);
				}

				// TODO: handle flipped cases
				if (reversed) {
					tip = next.activeRoute!.in;
				} else {
					tip = next.activeRoute!.out;
				}
			}

			sections.push(tip);
			length -= tip.length;
		}

		return {
			sections,

			tip: new SectionPosition(tip, reversed ? -length : tip.length + length, false)
		};
	}
}
