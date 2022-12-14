import { PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';
import PlanManager from '../../PlanManager';
import { Alert } from '../../types/AlertTypes';
import { UserOptions } from '../../types/BaseTypes';
import {
  PlanData,
  PlanModificationFunctions,
  PlanSpecialFunctions,
} from '../../types/PlanTypes';
import Utility from '../../utility/Utility';
import Year from './Year';
import { motion } from 'framer-motion';
import { SideCard } from '../../types/SideCardTypes';

interface ContentProps {
  data: PlanData;
  f: PlanModificationFunctions;
  f2: PlanSpecialFunctions;
  alert: Alert;
  sideCard: SideCard;
  switches: UserOptions;
}
class Content extends React.Component<ContentProps> {
  render() {
    let content = this.props.data;
    let years: JSX.Element[] = [];
    if (content.courses) {
      years = content.courses.map((year, index) => {
        return (
          <Year
            data={year}
            bookmarks={this.props.data.bookmarks}
            year={index}
            f={this.props.f}
            f2={this.props.f2}
            sideCard={this.props.sideCard}
            switches={this.props.switches}
            title={Utility.convertYear(index)}
            key={index}
          />
        );
      });
    }

    let units = PlanManager.getTotalCredits(content);

    let unitString = 'units';
    if (units === 1) {
      unitString = 'unit';
    }

    return (
      <motion.div
        className="bg-white dark:bg-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {years}
        <div className="flex m-5 justify-center gap-4">
          <div className="border-2 border-gray-200 rounded-lg p-1 w-48 dark:border-gray-600 shadow-sm">
            <p className="text-center text-sm font-light text-gray-400 dark:text-gray-400">
              <span className="font-medium">{units}</span> total {unitString}
            </p>
          </div>
          {content.courses.length < 10 && (
            <button
              className="block px-5 py-1 bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-500
                            dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-300 rounded-lg shadow-sm"
              onClick={() => {
                this.props.alert({
                  title: 'Add a year?',
                  message:
                    'This will add another year to your plan. You can remove it by removing all classes from that year and refreshing the page.',
                  confirmButton: 'Add year',
                  cancelButton: 'Close',
                  color: 'cyan',
                  icon: PlusIcon,
                  action: () => {
                    this.props.f2.addYear();
                  },
                });
              }}
            >
              Add year
            </button>
          )}
        </div>
      </motion.div>
    );
  }
}

export default Content;
