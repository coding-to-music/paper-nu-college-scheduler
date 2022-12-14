import {
  CloudIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React from 'react';
import toast from 'react-hot-toast';
import { SpinnerCircularFixed } from 'spinners-react';
import Account from '../../Account';
import {
  AccountDataMap,
  AccountModificationFunctions,
} from '../../types/AccountTypes';
import { Alert } from '../../types/AlertTypes';
import { UserOptions } from '../../types/BaseTypes';
import { Mode } from '../../utility/Constants';
import PlanError from '../../utility/PlanError';
import Utility from '../../utility/Utility';
import AccountPlan from './AccountPlan';
import AccountPlanMessage from './AccountPlanMessage';

interface AccountPlansProps {
  switches: UserOptions;
  alert: Alert;
  activatePlan: (planId: string) => void;
  activateSchedule: (scheduleId: string) => void;
  deactivate: () => void;
  activeId?: string;
  loading: boolean;
}

interface AccountPlansState {
  plans?: AccountDataMap;
  schedules?: AccountDataMap;
  loading: boolean;
  loggedIn: boolean;
  fa: AccountModificationFunctions;
}

class AccountPlans extends React.Component<
  AccountPlansProps,
  AccountPlansState
> {
  constructor(props: AccountPlansProps) {
    super(props);

    let self = this;

    let fa: AccountModificationFunctions = {
      activate: (id) => {
        if (props.switches.get.mode === Mode.SCHEDULE) {
          props.activateSchedule(id);
        } else {
          props.activatePlan(id);
        }
      },
      deactivate: () => {
        props.deactivate();
      },
      rename: (id, name) => {
        self.edit(id, name);
      },
      delete: (id, name) => {
        self.delete(id, name);
      },
    };

    this.state = {
      loading: true,
      loggedIn: false,
      fa,
    };
  }

  componentDidMount() {
    if (Account.isLoggedIn()) {
      this.setState({ loggedIn: true });
      Account.getPlans()
        .then((plans) => {
          // should only be undefined if a new access token is needed
          // a redirect should happen in that case
          if (!plans) return;

          Account.getSchedules()
            .then((schedules) => {
              if (!schedules) return;

              this.setState({
                plans,
                schedules,
                loading: false,
                loggedIn: true,
              });
            })
            .catch((error: PlanError) => {
              this.props.alert(
                Utility.errorAlert('account_get_plans', error.message)
              );
            });
        })
        .catch((error: PlanError) => {
          this.props.alert(
            Utility.errorAlert('account_get_plans', error.message)
          );
        });
    }
  }

  create(isSchedule: boolean) {
    const self = this;
    const t = isSchedule ? 'schedule' : 'plan';

    this.props.alert({
      title: `Creating a new ${t}...`,
      message: `Let's add a new ${t} to your account! You'll need to give it a name.`,
      cancelButton: 'Cancel',
      confirmButton: 'Create',
      color: 'rose',
      icon: PlusIcon,
      textInput: {
        placeholder: 'Name',
        match: /^[\w\-\s]{1,24}$/,
        matchError: 'Alphanumeric, hyphens and spaces, 1-24 chars',
        focusByDefault: true,
      },
      action: (name) => {
        if (!name) {
          self.props.alert(
            Utility.errorAlert(`account_create_${t}`, 'No Name')
          );
          return;
        }
        self.setState({ loading: true });
        toast.promise(
          isSchedule ? Account.createSchedule(name) : Account.createPlan(name),
          {
            loading: `Creating ${t}...`,
            success: (res) => {
              if (isSchedule) {
                self.setState({
                  schedules: res,
                  loading: false,
                });
              } else {
                self.setState({
                  plans: res,
                  loading: false,
                });
              }
              return `Created ${t}: ` + name.toUpperCase();
            },
            error: (error: PlanError) => {
              self.props.alert(
                Utility.errorAlert(`account_create_${t}`, error.message)
              );
              return 'Something went wrong';
            },
          }
        );
      },
    });
  }

  edit(id: string, name: string) {
    const self = this;
    const isSchedule = this.props.switches.get.mode === Mode.SCHEDULE;
    const t = isSchedule ? 'schedule' : 'plan';
    this.props.alert({
      title: `Editing ${name}`,
      message: `Enter a new name for this ${t}.`,
      cancelButton: 'Cancel',
      confirmButton: 'Save',
      color: 'sky',
      icon: PencilIcon,
      textInput: {
        placeholder: 'Name',
        match: /^[\w\-\s]{1,24}$/,
        matchError: 'Alphanumeric, hyphens and spaces, 1-24 chars',
        focusByDefault: true,
        defaultValue: name,
      },
      action: (newName) => {
        if (!newName) {
          self.props.alert(Utility.errorAlert(`account_edit_${t}`, 'No Name'));
          return;
        }
        self.setState({ loading: true });
        toast.promise(
          isSchedule
            ? Account.editScheduleInfo(id, newName)
            : Account.editPlanInfo(id, newName),
          {
            loading: `Updating ${t}...`,
            success: (res) => {
              if (isSchedule) {
                self.setState({
                  schedules: res,
                  loading: false,
                });
              } else {
                self.setState({
                  plans: res,
                  loading: false,
                });
              }
              return `Renamed ${name.toUpperCase()} to ${newName.toUpperCase()}`;
            },
            error: (error: PlanError) => {
              self.props.alert(
                Utility.errorAlert(`account_edit_${t}`, error.message)
              );
              return 'Something went wrong';
            },
          }
        );
      },
    });
  }

  delete(id: string, name: string) {
    const self = this;
    const isSchedule = this.props.switches.get.mode === Mode.SCHEDULE;
    const t = isSchedule ? 'schedule' : 'plan';

    this.props.alert({
      title: `Delete this ${t}?`,
      message: `Are you sure you want to delete your ${t} named '${name}' from your account? If it's active right now, it'll stay there, but it won't be linked to your account anymore.`,
      cancelButton: 'Cancel',
      confirmButton: 'Delete',
      color: 'red',
      icon: TrashIcon,
      action: () => {
        self.setState({ loading: true });
        toast.promise(
          (isSchedule ? Account.deleteSchedule : Account.deletePlan)(id),
          {
            loading: `Deleting ${t}...`,
            success: (res) => {
              if (isSchedule) {
                self.setState({
                  schedules: res,
                  loading: false,
                });
                let switches = this.props.switches;
                if (switches.get.active_schedule_id === id) {
                  this.props.switches.set('active_schedule_id', 'None', true);
                }
                return 'Deleted schedule: ' + name;
              } else {
                self.setState({
                  plans: res,
                  loading: false,
                });
                let switches = this.props.switches;
                if (switches.get.active_plan_id === id) {
                  this.props.switches.set('active_plan_id', 'None', true);
                }
                return 'Deleted plan: ' + name;
              }
            },
            error: (error: PlanError) => {
              self.props.alert(
                Utility.errorAlert(`account_delete_${t}`, error.message)
              );
              return 'Something went wrong';
            },
          },
          {
            success: {
              iconTheme: {
                primary: 'red',
                secondary: 'white',
              },
            },
          }
        );
      },
    });
  }

  logOut() {
    this.props.alert({
      title: 'Logging out...',
      message: `Are you sure you want to log out? Make sure your changes are saved!`,
      cancelButton: 'Cancel',
      confirmButton: 'Log out',
      color: 'rose',
      icon: ArrowRightOnRectangleIcon,
      action: () => {
        Account.logOut();
      },
    });
  }

  render() {
    let items: JSX.Element[] = [];
    const isSchedule = this.props.switches.get.mode === Mode.SCHEDULE;
    const t = isSchedule ? 'schedule' : 'plan';
    const darkMode = this.props.switches.get.dark as boolean;

    if (isSchedule) {
      if (this.state.schedules) {
        let self = this;
        items = Object.keys(this.state.schedules)
          .sort((a, b) => {
            let sa = this.state.schedules![a];
            let sb = this.state.schedules![b];

            const diff =
              (sa.lastUpdated || sa.createdAt) -
              (sb.lastUpdated || sb.createdAt);

            if (diff > 0) return -1;
            if (diff < 0) return 1;
            return 0;
          })
          .map((scheduleId, i) => {
            let schedule = this.state.schedules![scheduleId];
            return (
              <AccountPlan
                id={scheduleId}
                plan={schedule}
                fa={self.state.fa}
                active={scheduleId === self.props.activeId}
                key={`account-schedule-${i}`}
              />
            );
          });
      }
    } else {
      if (this.state.plans) {
        let self = this;
        items = Object.keys(this.state.plans)
          .sort((a, b) => {
            let pa = this.state.plans![a];
            let pb = this.state.plans![b];

            const diff =
              (pa.lastUpdated || pa.createdAt) -
              (pb.lastUpdated || pb.createdAt);

            if (diff > 0) return -1;
            if (diff < 0) return 1;
            return 0;
          })
          .map((planId, i) => {
            let plan = this.state.plans![planId];
            return (
              <AccountPlan
                id={planId}
                plan={plan}
                fa={self.state.fa}
                active={planId === self.props.activeId}
                key={`account-plan-${i}`}
              />
            );
          });
      }
    }

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        className="border-4 border-rose-300 my-2 rounded-2xl shadow-lg h-full
            overflow-y-scroll no-scrollbar"
      >
        <p className="text-center text-2xl text-rose-300 font-bold my-4">
          {isSchedule ? 'SCHEDULES' : 'PLANS'}
        </p>
        {!this.state.loggedIn ? (
          <AccountPlanMessage
            icon={<CloudIcon className="w-12 h-12" />}
            title="Save your stuff"
            description="By creating an account, you can save up to 5 plans and 10 schedules. You can access them from any device at any time. It's super simple."
            primaryButton={{
              text: 'Log in',
              action: () => {
                Account.logIn();
              },
            }}
          />
        ) : this.state.loading || this.props.loading ? (
          <AccountPlanMessage
            icon={
              <SpinnerCircularFixed
                size={64}
                thickness={160}
                speed={200}
                color={darkMode ? 'rgb(251, 113, 133)' : 'rgb(244, 63, 94)'}
                secondaryColor={
                  darkMode ? 'rgb(64, 64, 64)' : 'rgba(245, 245, 245)'
                }
              />
            }
          />
        ) : items.length === 0 ? (
          <AccountPlanMessage
            icon={<PlusIcon className="w-12 h-12" />}
            title={`Create your first ${t}`}
            description={`Your account is all set up! Now, you can create your first ${t}.
              Any current ${t} data you have loaded right now will stay, and you'll have the option to save it to your new ${t}.`}
            primaryButton={{
              text: `Create a ${t}`,
              action: () => {
                this.create(isSchedule);
              },
            }}
            secondaryButton={{
              text: 'Log out',
              action: () => {
                this.logOut();
              },
            }}
          />
        ) : (
          <>
            <p className="mx-8 text-center text-sm text-gray-500">
              Select a {t} to activate it, and again to deactivate it.
              Activating empty {t}s won't overwrite current {t} data.
            </p>
            <div className="block m-4">{items}</div>
            {items.length < (isSchedule ? 20 : 5) && (
              <button
                className="block mx-auto my-2 px-8 py-1 bg-rose-300 text-white hover:bg-rose-400
                                dark:bg-rose-600 dark:hover:bg-rose-500 rounded-lg shadow-sm"
                onClick={() => {
                  this.create(isSchedule);
                }}
              >
                Create another {t}
              </button>
            )}
            <button
              className="block mx-auto my-2 px-8 py-1 bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-500
                            dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-300 rounded-lg shadow-sm"
              onClick={() => {
                this.logOut();
              }}
            >
              Log out
            </button>
          </>
        )}
      </motion.div>
    );
  }
}

export default AccountPlans;
