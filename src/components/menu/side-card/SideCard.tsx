import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { UserOptions } from '../../../types/BaseTypes';
import { SideCardData } from '../../../types/SideCardTypes';
import SideCardButton from './SideCardButton';
import SideCardItem from './SideCardItem';

interface SideCardProps {
  data: SideCardData;
  switches: UserOptions;
  close: () => void;
}

function SideCard({ data, switches, close }: SideCardProps) {
  return (
    <div className="fixed w-screen md:max-w-md h-screen top-0 right-0 z-40 px-4 py-8">
      <motion.div
        className="w-full h-full bg-white dark:bg-gray-700 rounded-xl shadow-xl p-4 overflow-y-scroll no-scrollbar"
        initial={{
          x: 448,
        }}
        animate={{
          x: 0,
        }}
        exit={{
          x: 448,
        }}
        transition={{
          duration: 0.5,
          type: 'spring',
        }}
      >
        <div className="flex w-full items-center gap-2 mb-8">
          <p
            className={`text-${data.themeColor}-400 text-sm font-bold tracking-wider flex-grow`}
          >
            {data.type}
          </p>
          <div>
            <button
              className="text-gray-600 dark:text-gray-500 flex items-center hover:text-red-400 dark:hover:text-red-400 active:text-red-500 dark:active:text-red-300"
              onClick={() => close()}
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
          </div>
        </div>
        {data.alertMessage && (
          <div className="my-4 p-2 border-2 border-red-500 dark:border-red-400 bg-red-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-300 font-medium text-center">
              {data.alertMessage}
            </p>
          </div>
        )}
        <p
          className={`text-2xl font-bold text-gray-800 dark:text-gray-50 text-center sm:text-left`}
        >
          {data.title}
        </p>
        {data.subtitle && (
          <p className="text-lg font-light text-gray-800 dark:text-gray-100 text-center sm:text-left">
            {data.subtitle}
          </p>
        )}
        {data.message && (
          <p className="my-4 text-sm text-gray-600 dark:text-gray-400">
            {data.message}
          </p>
        )}
        {data.items && (
          <div className="mt-4">
            {data.items.map((item, i) => (
              <SideCardItem
                key={`side-card-item-${i}`}
                data={item}
                color={data.themeColor}
              />
            ))}
          </div>
        )}
        {data.buttons && (
          <div className="m-4 mt-8">
            {data.buttons.map((button, i) => (
              <SideCardButton
                key={`side-card-button-${i}`}
                data={button}
                close={close}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default SideCard;
