import { Dialog, Switch, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useState } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip as MapTooltip,
} from 'react-leaflet';
import ScheduleManager from '../../ScheduleManager';
import { Color, UserOptions } from '../../types/BaseTypes';
import { ScheduleDataMap, ScheduleSection } from '../../types/ScheduleTypes';
import Tooltip from '../generic/Tooltip';
import { getMapMarkerIcon, MapFlyTo } from './MapUtility';

const DEFAULT_POSITION: [number, number] = [42.055909, -87.675709];
const DEFAULT_ZOOM = 16;

interface CampusMapProps {
  schedule: ScheduleDataMap;
  switches: UserOptions;
  onClose: () => void;
}

interface ClassMarker {
  location: [number, number];
  sections: ScheduleSection[];
  color: Color;
}

function CampusMap({ schedule, switches, onClose }: CampusMapProps) {
  const [open, setOpen] = useState(true);
  const [flyPosition, setFlyPosition] = useState<
    [number, number] | undefined
  >();

  const minimap = switches.get.minimap;

  const locations: ClassMarker[] = [];

  sections: for (const sectionId in schedule) {
    const { lat, lon } =
      ScheduleManager.getLocation(schedule[sectionId].room) ?? {};
    if (!lat || !lon) continue;

    for (const loc of locations) {
      const [latt, lont] = loc.location;
      if (latt === lat && lont === lon) {
        loc.sections.push(schedule[sectionId]);
        continue sections;
      }
    }

    locations.push({
      location: [lat, lon],
      sections: [schedule[sectionId]],
      color: ScheduleManager.getCourseColor(schedule[sectionId].subject),
    });
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className={`${switches.get.dark ? 'dark' : ''} relative z-40`}
        onClose={() => setOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => onClose()}
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex w-screen h-screen relative items-center justify-center p-4 md:p-16 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-full p-2 bg-white dark:bg-gray-700 rounded-lg relative overflow-hidden">
                <MapContainer
                  center={DEFAULT_POSITION}
                  zoom={DEFAULT_ZOOM}
                  zoomControl={false}
                  className="w-full h-full rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map(({ location, sections, color }, i) => (
                    <Marker
                      position={location}
                      key={`map-marker-${i}`}
                      icon={getMapMarkerIcon(color)}
                    >
                      <MapTooltip>
                        <div>
                          {sections.map((section, j) => (
                            <div
                              className="my-2 font-sans"
                              key={`map-tooltip-${i}-${j}`}
                            >
                              <p className="font-extrabold">
                                {section.subject} {section.number}-
                                {section.section}
                                {section.component !== 'LEC'
                                  ? ' (' + section.component + ')'
                                  : ''}
                              </p>
                              <p className="font-medium">{section.title}</p>
                              <p className="italic">{section.room}</p>
                            </div>
                          ))}
                        </div>
                      </MapTooltip>
                    </Marker>
                  ))}
                  <MapFlyTo position={flyPosition || DEFAULT_POSITION} />
                </MapContainer>
                <div className="absolute top-0 right-0 bg-white dark:bg-gray-700 p-2 z-[500] rounded-lg flex items-center gap-2">
                  <Switch
                    checked={minimap}
                    onChange={() => switches.set('minimap', !minimap, true)}
                    className={`${
                      minimap
                        ? 'bg-emerald-400 hover:bg-emerald-500 active:bg-emerald-600'
                        : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-400'
                    }
                      relative group inline-flex w-12 h-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                  >
                    <span
                      aria-hidden="true"
                      className={`${minimap ? 'translate-x-5' : 'translate-x-0'}
                        pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                    />
                    <Tooltip color="emerald" className="-bottom-10 right-0">
                      Minimap
                    </Tooltip>
                  </Switch>
                  <button className="relative group">
                    <XMarkIcon
                      className="w-8 h-8 text-gray-600 dark:text-gray-500
                      hover:text-red-400 dark:hover:text-red-400 active:text-red-500 dark:active:text-red-300"
                      onClick={() => setOpen(false)}
                    />
                    <Tooltip color="red" className="-bottom-10 right-0">
                      Close map
                    </Tooltip>
                  </button>
                </div>
                {locations.length > 0 && (
                  <div className="absolute right-2 p-2 bottom-8 md:bottom-1/2 md:translate-y-1/2 z-[500] flex flex-col bg-white dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50 rounded-l-lg">
                    <p className="text-xs italic text-gray-600 dark:text-gray-200 font-bold">
                      Hover to find class
                    </p>
                    {locations.map(({ location, sections }, i) => (
                      <Fragment key={`map-list-${i}`}>
                        {sections.map((section, j) => (
                          <div
                            className="w-full text-right text-sm font-medium flex gap-2 cursor-pointer text-gray-500 hover:text-black dark:text-gray-300 dark:hover:text-white"
                            key={`map-list-${i}-${j}`}
                            onMouseEnter={() => setFlyPosition(location)}
                            onMouseLeave={() => setFlyPosition(undefined)}
                          >
                            <p className="font-light">{section.component}</p>
                            <p className="flex-grow">
                              {section.subject} {section.number}-
                              {section.section}
                            </p>
                          </div>
                        ))}
                      </Fragment>
                    ))}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default CampusMap;
