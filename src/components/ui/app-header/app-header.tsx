import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link, NavLink } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

type TNavLinkState = {
  isActive: boolean;
};

const getIconType = (isActive: boolean): 'primary' | 'secondary' =>
  isActive ? 'primary' : 'secondary';

export const AppHeaderUI = ({
  userName,
  isConstructorActive = false,
}: TAppHeaderUIProps): React.JSX.Element => (
  <header className={styles.header}>
    <nav className={clsx(styles.menu, 'p-4')}>
      <div className={styles.menu_part_left}>
        <NavLink
          to="/"
          end
          className={({ isActive }: TNavLinkState) =>
            clsx(
              styles.link,
              (isActive || isConstructorActive) && styles.link_active,
              'mr-10'
            )
          }
        >
          {({ isActive }: TNavLinkState) => (
            <>
              <BurgerIcon type={getIconType(isActive || isConstructorActive)} />
              <p className="text text_type_main-default ml-2">Конструктор</p>
            </>
          )}
        </NavLink>
        <NavLink
          to="/feed"
          className={({ isActive }: TNavLinkState) =>
            clsx(styles.link, isActive && styles.link_active)
          }
        >
          {({ isActive }: TNavLinkState) => (
            <>
              <ListIcon type={getIconType(isActive)} />
              <p className="text text_type_main-default ml-2">Лента заказов</p>
            </>
          )}
        </NavLink>
      </div>
      <Link to="/" className={styles.logo}>
        <Logo className="" />
      </Link>
      <div className={styles.link_position_last}>
        <NavLink
          to="/profile"
          className={({ isActive }: TNavLinkState) =>
            clsx(styles.link, isActive && styles.link_active)
          }
        >
          {({ isActive }: TNavLinkState) => (
            <>
              <ProfileIcon type={getIconType(isActive)} />
              <p className="text text_type_main-default ml-2">
                {userName ?? 'Личный кабинет'}
              </p>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  </header>
);
