import {
  AcademicCapIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentCheckIcon,
  HashtagIcon,
  InformationCircleIcon,
  ListBulletIcon,
  MapPinIcon,
  PuzzlePieceIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import PlanManager from '../PlanManager';
import ScheduleManager from '../ScheduleManager';
import { Alert } from '../types/AlertTypes';
import { IconElement, UserOptions } from '../types/BaseTypes';
import { Course } from '../types/PlanTypes';
import {
  ScheduleBookmarks,
  ScheduleModificationFunctions,
  ScheduleSection,
} from '../types/ScheduleTypes';
import { SearchModificationFunctions } from '../types/SearchTypes';
import {
  AnySideCardButtonData,
  SideCard,
  SideCardData,
  SideCardItemData,
} from '../types/SideCardTypes';
import Utility from './Utility';

function getDetails(
  detail: string,
  section: ScheduleSection,
  course?: Course,
  alert?: Alert
): [IconElement, ReactNode] | undefined {
  switch (detail) {
    case 'SECTION NUMBER':
      return [HashtagIcon, section.section];
    case 'COMPONENT':
      return [
        PuzzlePieceIcon,
        Utility.capitalizeFirstLetter(
          Utility.convertSectionComponent(section.component)
        ),
      ];
    case 'TIME SLOT':
      return [
        ClockIcon,
        `${
          section.meeting_days && section.start_time && section.end_time
            ? `${Utility.convertAllDaysToString(
                section.meeting_days
              )} ${Utility.convertTime(
                section.start_time,
                true
              )} - ${Utility.convertTime(section.end_time, true)}`
            : undefined
        }`,
      ];
    case 'INSTRUCTOR':
      return [
        UserIcon,
        section.instructors?.map((instructor, i) => (
          <button
            className="my-1 underline underline-offset-4
              hover:text-rose-500 dark:hover:text-rose-300
              active:text-rose-600 dark:active:text-rose-200"
            key={`section-info-instructor-${i}`}
            onClick={() => {
              alert?.({
                icon: UserIcon,
                title: instructor.name ?? 'No name',
                subtitle: `${section.subject} ${section.number} (section ${section.section})`,
                color: 'rose',
                cancelButton: 'Close',
                extras: [
                  {
                    title: 'Phone Number',
                    content: instructor.phone ?? 'Not provided',
                  },
                  {
                    title: 'Campus Address',
                    content: instructor.campus_address ?? 'Not provided',
                  },
                  {
                    title: 'Office Hours',
                    content: instructor.office_hours ?? 'Not provided',
                  },
                  {
                    title: 'Bio',
                    content: instructor.bio ?? 'Not provided',
                  },
                  {
                    title: 'URL',
                    content: instructor.url ?? 'Not provided',
                  },
                ],
              });
            }}
          >
            {instructor.name}
          </button>
        )),
      ];
    case 'LOCATION':
      return [MapPinIcon, section.room];
    case 'START/END DATES':
      return [
        CalendarDaysIcon,
        section.start_date && section.end_date
          ? `${section.start_date} to ${section.end_date}`
          : undefined,
      ];
    case 'PREREQUISITES':
      return [ListBulletIcon, course?.prereqs];
    case 'DISTRIBUTION AREAS':
      return [
        BuildingLibraryIcon,
        section?.distros
          ? Utility.convertDistros(section.distros).join(', ')
          : undefined,
      ];
    case 'UNITS':
      return [AcademicCapIcon, course?.units];
    case 'CAPACITY':
      return [UsersIcon, section.capacity];
    case 'ENROLLMENT REQUIREMENTS':
      return [
        DocumentCheckIcon,
        Utility.cleanEnrollmentRequirements(section.enrl_req),
      ];
    case 'DESCRIPTIONS':
      return [
        InformationCircleIcon,
        section?.descs ? (
          <div className="flex flex-col gap-2">
            {section.descs.map(([name, value], i) => (
              <div key={`section-info-desc-${i}`}>
                <p>{name}</p>
                <p className="text-left font-light text-sm">{value}</p>
              </div>
            ))}
          </div>
        ) : undefined,
      ];
  }
}

interface SectionModificationWithinInfo {
  bookmarks: ScheduleBookmarks;
  sf: ScheduleModificationFunctions;
  ff: SearchModificationFunctions;
}

export function openInfo(
  sideCard: SideCard,
  alert: Alert,
  switches: UserOptions,
  section: ScheduleSection,
  mod?: SectionModificationWithinInfo
) {
  const name = section.subject + ' ' + section.number;
  const course = PlanManager.getCourse(name);
  const scheduleCourse = ScheduleManager.getCourseById(
    section.section_id.split('-')[0]
  );

  const items = switches.get.section_info_details?.split(',') ?? [
    'SECTION NUMBER',
    'COMPONENT',
    'TIME SLOT',
    'INSTRUCTOR',
    'LOCATION',
    'START/END DATES',
    'PREREQUISITES',
    'DISTRIBUTION AREAS',
    'UNITS',
    'CAPACITY',
    'ENROLLMENT REQUIREMENTS',
    'DESCRIPTIONS',
  ];

  let sideCardButtons: AnySideCardButtonData[] | undefined;

  if (mod) {
    sideCardButtons = [
      {
        text: 'Show all sections',
        onClick: () => mod.ff.set(name, scheduleCourse?.course_id),
      },
      {
        text: 'Remove section',
        danger: true,
        onClick: (close) => {
          mod.sf.removeSection(section);
          close();
        },
      },
    ];

    if (scheduleCourse) {
      sideCardButtons.splice(1, 0, {
        toggle: true,
        data: mod.bookmarks,
        key: scheduleCourse,
        indexProperty: 'course_id',
        enabled: {
          text: 'Remove from My List',
          onClick: () => {
            mod.sf.removeScheduleBookmark(scheduleCourse);
          },
        },
        disabled: {
          text: 'Add to My List',
          onClick: () => {
            mod.sf.addScheduleBookmark(scheduleCourse);
          },
        },
      });
    }
  }

  const sideCardData: SideCardData = {
    type: mod ? 'SECTION INFO' : 'SECTION INFO (SEARCH)',
    themeColor: PlanManager.getCourseColor(name),
    title: name,
    subtitle: section.title,
    message: course?.description ?? 'No course description available',
    items: items.reduce<SideCardItemData[]>((filtered, item) => {
      const [icon, value] = getDetails(item, section, course, alert) ?? [];
      if (value) {
        filtered.push({
          key: item,
          icon,
          value,
        });
      }
      return filtered;
    }, []),
    buttons: sideCardButtons,
  };

  sideCard(sideCardData);
}
