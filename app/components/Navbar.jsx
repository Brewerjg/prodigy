import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { 
  Bars3Icon, 
  XMarkIcon, 
  BuildingOfficeIcon,
  ChartBarIcon,
  FolderIcon,
  CalendarIcon,
  BellIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon, current: true },
  { name: 'Companies', href: '/companies', icon: BuildingOfficeIcon, current: false },
  { name: 'Projects', href: '#', icon: FolderIcon, current: false },
  { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 justify-between items-center">
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-open:block" />
            </DisclosureButton>
          </div>

          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                  ConnectWise Portal
                </h1>
              </div>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent',
                    'group flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <Icon
                    className={classNames(
                      item.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-2 h-4 w-4'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <div>
                <MenuButton className="relative flex items-center space-x-3 rounded-lg bg-white p-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">JD</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">john@company.com</p>
                  </div>
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-200 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">john@company.com</p>
                </div>
                
                <MenuItem>
                  <a
                    href="#"
                    className="group flex items-center px-4 py-3 text-sm text-gray-700 data-focus:bg-gray-50 data-focus:text-gray-900 transition-colors"
                  >
                    <UserIcon className="mr-3 h-4 w-4 text-gray-400 group-data-focus:text-gray-500" />
                    Your Profile
                  </a>
                </MenuItem>
                
                <MenuItem>
                  <a
                    href="#"
                    className="group flex items-center px-4 py-3 text-sm text-gray-700 data-focus:bg-gray-50 data-focus:text-gray-900 transition-colors"
                  >
                    <Cog6ToothIcon className="mr-3 h-4 w-4 text-gray-400 group-data-focus:text-gray-500" />
                    Settings
                  </a>
                </MenuItem>
                
                <div className="border-t border-gray-100 mt-2">
                  <MenuItem>
                    <a
                      href="#"
                      className="group flex items-center px-4 py-3 text-sm text-gray-700 data-focus:bg-gray-50 data-focus:text-gray-900 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4 text-gray-400 group-data-focus:text-gray-500" />
                      Sign out
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <DisclosurePanel className="sm:hidden border-t border-gray-200">
        <div className="space-y-1 px-4 py-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                className={classNames(
                  item.current
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                  'group flex items-center border-l-4 py-3 px-3 text-base font-medium transition-colors'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                <Icon
                  className={classNames(
                    item.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </DisclosureButton>
            );
          })}
        </div>
        
        {/* Mobile user info */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">JD</span>
            </div>
            <div>
              <p className="text-base font-medium text-gray-800">John Doe</p>
              <p className="text-sm text-gray-500">john@company.com</p>
            </div>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
