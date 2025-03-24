import { District } from "./district";
import { PowerDistrict } from "./power-district";
import { Route } from "./route";
import { Router } from "./router";
import { Section } from "./section";
import { TilePattern, Tile } from "./tile";
import { Track } from "./track";
import { Device } from "./device/index";
import { ResponderType } from "./positioner/responder-type";
import { Channel } from "./device/channel";
import { PointPositioner } from "./positioner/point";
import { PowerDistrictActivator } from "./power-district/activator";
import { PowerDistrictReverser } from "./power-district/reverser";
import { PowerDistrictMonitor } from "./power-district/monitor";
import { Monitor } from "./monitor";
import { Throttle } from "./throttle";

export class Layout {
	name: string;

	districts: District[] = [];

	devices: Device[] = [];
	responderType: ResponderType[] = [];

	monitors: Monitor[] = [];
	throttles: Throttle[] = [];

	get allDistricts() {
		const districts: District[] = [];

		function walkDistrict(district: District) {
			districts.push(district);

			for (let child of district.children) {
				walkDistrict(child);
			}
		}

		for (let district of this.districts) {
			walkDistrict(district);
		}

		return districts;
	}

	static from(document: any) {
		const layout = new Layout();

		const railway = document.firstChild!;
		layout.name = railway.getAttribute('name');

		const version = railway.getAttribute('version');

		if (version == '1') {
			let child = railway.firstChild;

			while (child) {
				if (child.tagName == 'district') {
					layout.districts.push(layout.loadDistrict(child, layout));
				}

				if (child.tagName == 'monitor') {
					layout.monitors.push(layout.loadMonitor(child, layout));
				}

				if (child.tagName == 'throttle') {
					layout.throttles.push(layout.loadThrottle(child, layout));
				}

				child = child.nextSibling;
			}

			child = railway.firstChild;
			let index = 0;

			while (child) {
				if (child.tagName == 'district') {
					layout.linkDistrict(child, layout.districts[index]);

					index++;
				}

				child = child.nextSibling;
			}
		} else {
			throw new Error(`Unsupported railway definition file version '${version}'`);
		}

		return layout;
	}

	loadMonitor(source, parent: District | Layout) {
		const montior = new Monitor(this.findDevice(source.getAttribute('device')), parent);

		return montior;
	}

	loadThrottle(source, parent: District | Layout) {
		const throttle = new Throttle(this.findDevice(source.getAttribute('device')), parent);

		return throttle;
	}

	loadDistrict(source, parent: District | Layout) {
		const district = new District(source.getAttribute('name'), parent);

		let child = source.firstChild;

		while (child) {
			if (child.tagName == 'power-districts') {
				let powerDistrict = child.firstChild;

				while (powerDistrict) {
					if (powerDistrict.tagName == 'power-district') {
						district.powerDistricts.push(this.loadPowerDistrict(powerDistrict, district));
					}

					powerDistrict = powerDistrict.nextSibling;
				}
			}

			if (child.tagName == 'section') {
				this.loadSection(child, district);
			}

			if (child.tagName == 'router') {
				district.routers.push(this.loadRouter(child, district));
			}

			if (child.tagName == 'district') {
				district.children.push(this.loadDistrict(child, district));
			}

			if (child.tagName == 'monitor') {
				district.monitors.push(this.loadMonitor(child, district));
			}

			child = child.nextSibling;
		}

		return district;
	}

	linkDistrict(source, district: District) {
		let child = source.firstChild;

		let sectionIndex = 0;
		let childIndex = 0;

		while (child) {
			if (child.tagName == 'section') {
				this.linkSection(child, district.sections[sectionIndex]);

				sectionIndex++;
			}

			if (child.tagName == 'router') {
				this.linkRouter(child, district.routers.find(router => router.name == child.getAttribute('name'))!);
			}

			if (child.tagName == 'district') {
				this.linkDistrict(child, district.children[childIndex]);

				childIndex++;
			}

			child = child.nextSibling;
		}
	}

	loadSection(source, district: District) {
		const section = new Section(source.getAttribute('name'), district);
		district.sections.push(section);

		let child = source.firstChild;

		while (child) {
			if (child.tagName == 'tracks') {
				let trackNode = child.firstChild;

				while (trackNode) {
					if (trackNode.tagName == 'track') {
						const track = new Track(
							section,
							+trackNode.getAttribute('length'),
							trackNode.getAttribute('path')
						);

						section.tracks.push(track);

						let trackChild = trackNode.firstChild;

						while (trackChild) {
							if (trackChild.tagName == 'positioners') {
								let positioner = trackChild.firstChild;

								while (positioner) {
									if (positioner.tagName == 'point') {
										const device = this.findDevice(positioner.getAttribute('device'));
										const channel = this.findChannel(device, positioner.getAttribute('channel'));
										const responderType = this.findResponderType(positioner.getAttribute('responder'));

										track.positioners.push(new PointPositioner(
											track,
											+positioner.getAttribute('offset'),
											channel,
											responderType
										));
									}

									positioner = positioner.nextSibling;
								}
							}

							trackChild = trackChild.nextSibling;
						}
					}

					trackNode = trackNode.nextSibling;
				}
			}

			if (child.tagName == 'tile') {
				const pattern = child.getAttribute('pattern');

				if (!(pattern in TilePattern.patterns)) {
					throw new Error(`Unknown tile pattern '${pattern}' in tile ${section.tiles.length + 1} in ${section.domainName}`);
				}

				section.tiles.push(new Tile(section, +child.getAttribute('x'), +child.getAttribute('y'), TilePattern.patterns[pattern]))
			}

			child = child.nextSibling;
		}
	}

	findDevice(identifier: string) {
		let device = this.devices.find(device => device.identifier == identifier);

		if (device) {
			return device;
		}

		device = new Device(identifier);
		this.devices.push(device);

		return device;
	}

	findChannel(device: Device, name: string) {
		let channel = device.channels.find(channel => channel.name == name);

		if (channel) {
			return channel;
		}

		channel = new Channel(device, name);
		device.channels.push(channel);

		return channel;
	}

	findResponderType(name: string) {
		let type = this.responderType.find(type => type.name == name);

		if (type) {
			return type;
		}

		type = new ResponderType(name);
		this.responderType.push(type);

		return type;
	}

	linkSection(source, section: Section) {
		let child = source.firstChild;

		while (child) {
			if (child.tagName == 'out') {
				const out = this.findSection(child.getAttribute('section'), section.district);

				section.out = out;
				out.in = section;
			}

			child = child.nextSibling;
		}
	}

	findSection(path: string, base: District, source = base) {
		const parts = path.split('.');

		if (parts.length == 0) {
			throw `section '${path}' not found from '${source.name}': invalid name`;
		}

		if (parts.length == 1) {
			const localSection = base.sections.find(section => section.name == parts[0]);

			if (!localSection) {
				throw new Error(`Section '${path}' not found from '${source.name}': section does not exist in '${base.name}'`);
			}

			return localSection;
		}

		const sectionName = parts.pop()!;

		let pool: District | Layout = base;

		for (let index = 0; index < parts.length; index++) {
			if (pool instanceof Layout || !pool.parent) {
				throw new Error(`Section '${path}' could not be found from '${source.name}': district '${pool.name}' does not have a parent`);
			}

			pool = pool.parent!;
		}

		for (let part of parts) {
			const child = (pool instanceof District ? pool.children : pool.districts).find(child => child.name == part);

			if (!child) {
				throw new Error(`Section '${path}' could not be found from '${source.name}': district '${pool.name}' does not have a child named '${part}'`);
			}

			pool = child;
		}

		if (pool instanceof Layout) {
			throw new Error(`Section '${path}' could not be found from '${source.name}': a layout cannot directly include a section`);
		}

		return this.findSection(sectionName, pool, source);
	}

	loadRouter(source, district: District) {
		const router = new Router(source.getAttribute('name'), district);

		return router;
	}

	linkRouter(source, router: Router) {
		let child = source.firstChild;
		let active: Route;

		while (child) {
			if (child.tagName == 'route') {
				const route = new Route(child.getAttribute('name'), router);

				route.in = this.findSection(child.getAttribute('in'), router.district);
				route.in.out = router;

				route.out = this.findSection(child.getAttribute('out'), router.district);
				route.out.in = router;

				if (child.hasAttribute('active')) {
					if (active) {
						throw new Error(`Router '${router.domainName}' has multiple active routes (${active.name}, ${route.name}).`);
					}

					active = route;
				}

				router.routes.push(route);
			}

			child = child.nextSibling;
		}

		router.activeRoute = active;
	}

	loadPowerDistrict(source, district: District) {
		const powerDistrict = new PowerDistrict(source.getAttribute('name'), district);

		let actor = source.firstChild;

		while (actor) {
			if (actor.tagName == 'activator' || actor.tagName == 'reverser' || actor.tagName == 'monitor') {
				const device = this.findDevice(actor.getAttribute('device'));
				const channel = this.findChannel(device, actor.getAttribute('channel'));

				if (actor.tagName == 'activator') {
					powerDistrict.activator = new PowerDistrictActivator(device, channel);
				}

				if (actor.tagName == 'reverser') {
					powerDistrict.reverser = new PowerDistrictReverser(device, channel);
				}

				if (actor.tagName == 'monitor') {
					powerDistrict.monitor = new PowerDistrictMonitor(device, channel);
				}
			}

			actor = actor.nextSibling;
		}

		return powerDistrict;
	}

	toDot() {
		let dot = 'digraph G {';

		for (let district of this.districts) {
			dot += district.toDotDefinition();
		}

		for (let district of this.districts) {
			dot += district.toDotConnection();
		}

		return `${dot}}`;
	}

	toSVG(inject = '') {
		const positons = this.districts.map(district => district.findSVGPositions()).flat(Infinity);

		const width = Math.max(...positons.map(position => position.x));
		const height = Math.max(...positons.map(position => position.y));

		let svg = `<svg width="100vw" height="100vh" viewBox="0 0 ${width + 1} ${height + 1}" xmlns="http://www.w3.org/2000/svg">
			<style>

				path {
					fill: none;
					stroke: #000;
					stroke-width: 0.2;
				}

			</style>
		`;

		for (let district of this.districts) {
			svg += district.toSVG();
		}

		return `${svg}${inject}</svg>`;
	}

	dump() {
		console.group(`Layout ${this.name}`);
		console.log('devices');

		for (let device of this.devices) {
			device.dump();
		}

		console.log('responder types');

		for (let type of this.responderType) {
			type.dump();
		}

		console.log('districts');

		for (let district of this.districts) {
			district.dump();
		}

		console.groupEnd();
	}
}
