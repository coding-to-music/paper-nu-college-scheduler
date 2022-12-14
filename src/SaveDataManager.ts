import debug from 'debug';
import Account from './Account';
import { getDataMapInformation } from './DataManager';
import PlanManager from './PlanManager';
import ScheduleManager from './ScheduleManager';
import { AccountDataMap } from './types/AccountTypes';
import {
  LoadMethods,
  LoadResponse,
  ReadUserOptions,
  UserOptions,
} from './types/BaseTypes';
import { PlanData } from './types/PlanTypes';
import { ScheduleData } from './types/ScheduleTypes';
import { Mode } from './utility/Constants';
var d = debug('save-data-manager');

const DEFAULT_SWITCHES: ReadUserOptions = {
  notifications: true,
  settings_tab: 'General',
  mode: Mode.PLAN,
  schedule_warnings: true,
  minimap: true,
};

function matchAccountId(accountData: AccountDataMap, content: string) {
  for (let id in accountData) {
    if (accountData[id].content === content) {
      return id;
    }
  }
}

let SaveDataManager = {
  load: async (
    params: URLSearchParams | undefined,
    switches: UserOptions
  ): Promise<LoadResponse<PlanData | ScheduleData>> => {
    let activeId: string | undefined = undefined;
    let originalDataString: string = '';
    let accountPlans: AccountDataMap | undefined = undefined;
    let accountSchedules: AccountDataMap | undefined = undefined;
    let method: LoadMethods = 'None';
    const latestTermId = (await getDataMapInformation()).latest;

    if (Account.isLoggedIn()) {
      const accountInit = Account.init();
      accountPlans = await accountInit.plans;
      accountSchedules = await accountInit.schedule;
      activeId = 'None';
    }

    if (params) {
      d('trying to load schedule URL data');
      let scheduleData = await ScheduleManager.loadFromURL(params);
      if (scheduleData !== 'empty') {
        if (scheduleData !== 'malformed') {
          d('schedule URL load successful');
          method = 'URL';
          if (!params.has('s') && !params.has('sf')) {
            d('no content, just term change');
            method = 'TermChange';
          } else if (accountSchedules) {
            let dataStr = params.toString();
            let id = matchAccountId(accountSchedules, dataStr);
            if (id) {
              d('matched content to account schedule: %s', id);
              activeId = id;
              originalDataString = dataStr;
              method = 'Account';
            }
          }
          ScheduleManager.save(scheduleData);
          d('schedule data loaded');
        }
        const response: LoadResponse<ScheduleData> = {
          mode: Mode.SCHEDULE,
          data: scheduleData,
          activeId,
          originalDataString,
          method,
          latestTermId,
        };
        return response;
      }

      d('no schedule URL data to load, trying plan URL data instead');
      let planData = await PlanManager.loadFromURL(params);
      if (planData !== 'empty') {
        if (planData !== 'malformed') {
          d('plan URL load successful');
          method = 'URL';
          if (accountPlans) {
            let dataStr = params.toString();
            let id = matchAccountId(accountPlans, dataStr);
            if (id) {
              d('matched content to account plan: %s', id);
              activeId = id;
              originalDataString = dataStr;
              method = 'Account';
            }
          }
          PlanManager.save(planData);
          d('plan data loaded');
        }
        const response: LoadResponse<PlanData> = {
          mode: Mode.PLAN,
          data: planData,
          activeId,
          originalDataString,
          method,
          latestTermId,
        };
        return response;
      }

      d('nothing to load from URL');
    }
    const mode = switches.get.mode as Mode;
    d('last mode used is %d', mode);

    if (mode === Mode.PLAN) {
      d('trying to load plan data from account');
      let storedPlanId = switches.get.active_plan_id;
      if (accountPlans && storedPlanId) {
        if (storedPlanId in accountPlans) {
          let content = accountPlans[storedPlanId].content;
          let data = await PlanManager.loadFromString(content);
          if (data !== 'empty') {
            if (data !== 'malformed') {
              d('account plan load successful: %s', storedPlanId);
              activeId = storedPlanId;
              originalDataString = content;
              PlanManager.save(data);
              d('plan data loaded');
            }
            const response: LoadResponse<PlanData> = {
              mode: Mode.PLAN,
              data,
              activeId,
              originalDataString,
              method: 'Account',
              latestTermId,
            };
            return response;
          }
        }
      }

      d('nothing to load from account, trying storage instead');
      let data = await PlanManager.loadFromStorage();
      if (data !== 'empty') {
        if (data !== 'malformed') {
          d('plan storage load successful');
          method = 'Storage';
          if (accountPlans) {
            let dataStr = PlanManager.getDataString(data);
            let id = matchAccountId(accountPlans, dataStr);
            if (id) {
              d('matched content to account plan: %s', id);
              activeId = id;
              originalDataString = dataStr;
              method = 'Account';
            }
          }
          PlanManager.save(data);
          d('plan data loaded');
        }
        const response: LoadResponse<PlanData> = {
          mode: Mode.PLAN,
          data,
          activeId,
          originalDataString,
          method,
          latestTermId,
        };
        return response;
      }
    } else if (mode === Mode.SCHEDULE) {
      let storedScheduleId = switches.get.active_schedule_id;
      if (accountSchedules && storedScheduleId) {
        if (storedScheduleId in accountSchedules) {
          let content = accountSchedules[storedScheduleId].content;
          let data = await ScheduleManager.loadFromString(content);
          if (data !== 'empty') {
            if (data !== 'malformed') {
              d('account schedule load successful: %s', storedScheduleId);
              activeId = storedScheduleId;
              originalDataString = content;
              ScheduleManager.save(data);
              d('schedule data loaded');
            }
            const response: LoadResponse<ScheduleData> = {
              mode: Mode.SCHEDULE,
              data,
              activeId,
              originalDataString,
              method: 'Account',
              latestTermId,
            };
            return response;
          }
        }
      }

      d('nothing to load from account, trying storage instead');
      let data = await ScheduleManager.loadFromStorage();
      if (data !== 'empty') {
        if (data !== 'malformed') {
          d('schedule storage load successful');
          method = 'Storage';
          if (accountPlans) {
            let dataStr = ScheduleManager.getDataString(data);
            let id = matchAccountId(accountPlans, dataStr);
            if (id) {
              d('matched content to account schedule: %s', id);
              activeId = id;
              originalDataString = dataStr;
              method = 'Account';
            }
          }
          ScheduleManager.save(data);
          d('schedule data loaded');
        }
        const response: LoadResponse<ScheduleData> = {
          mode: Mode.SCHEDULE,
          data,
          activeId,
          originalDataString,
          method,
          latestTermId,
        };
        return response;
      }
    }

    d('no data to load');
    return {
      mode,
      data: 'empty',
      activeId,
      originalDataString,
      method,
      latestTermId,
    };
  },
  loadSwitchesFromStorage: (
    setSwitchFunction: (
      key: keyof ReadUserOptions,
      val: any,
      save: boolean | undefined
    ) => void
  ): UserOptions => {
    let switches = Object.assign<ReadUserOptions, ReadUserOptions>(
      {},
      DEFAULT_SWITCHES
    );
    let keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('switch_')) {
        let store = localStorage.getItem(keys[i]);
        let val: any = undefined;
        if (store != null) {
          if (store === 'true') val = true;
          else if (store === 'false') val = false;
          else if (!isNaN(parseInt(store))) val = parseInt(store);
          else val = store;
        }
        let switchId = keys[i].substring(7) as keyof ReadUserOptions;
        switches[switchId] = val;
      }
    }
    return {
      set: setSwitchFunction,
      get: switches,
    };
  },

  saveSwitchToStorage: (key: string, val?: string) => {
    if (val) {
      localStorage.setItem('switch_' + key, val);
    } else {
      localStorage.removeItem('switch_' + key);
    }
  },
};

export default SaveDataManager;
