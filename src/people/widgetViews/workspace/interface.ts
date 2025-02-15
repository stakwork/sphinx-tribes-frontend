import { BountyRoles, BudgetHistory, Workspace, PaymentHistory, Person } from 'store/interface';

export interface ModalProps {
  isOpen: boolean;
  close: () => void;
  uuid?: string;
  user?: Person;
  addToast?: (text: string, color: 'danger' | 'success') => void;
}

export interface EditWorkspaceModalProps extends ModalProps {
  org?: Workspace;
  onDelete: () => void;
  resetWorkspace: (Workspace: any) => void;
  addToast: (title: string, color: 'danger' | 'success') => void;
}

export interface ManageWorkspaceUsersModalProps extends ModalProps {
  org?: Workspace;
  users: Person[];
  updateUsers: (users: Person[]) => void;
}

export interface UserRolesModalProps extends ModalProps {
  submitRoles: (roles: BountyRoles[]) => void;
  addToast: (title: string, color: 'danger' | 'success') => void;
}

export interface PaymentHistoryModalProps extends ModalProps {
  url: string;
  paymentsHistory: PaymentHistory[];
}

export interface BudgetHistoryModalProps extends ModalProps {
  budgetsHistory: BudgetHistory[];
}

export interface AddUserModalProps extends ModalProps {
  loading: boolean;
  onSubmit: (body: any) => void;
  disableFormButtons: boolean;
  setDisableFormButtons: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface AddBudgetModalProps extends ModalProps {
  invoiceStatus: boolean;
  startPolling: (inv: string) => void;
  setInvoiceStatus: (status: boolean) => void;
}

export interface WithdrawModalProps extends ModalProps {
  getWorkspaceBudget: () => Promise<void>;
}

export type InvoiceState = 'PENDING' | 'PAID' | 'EXPIRED' | null;

export interface PaymentHistoryUserInfo {
  pubkey: string;
  name: string;
  image: string;
}

export interface Toast {
  id: string;
  color: 'success' | 'primary' | 'warning' | 'danger' | undefined;
  text: string;
  title: string;
}

export interface UserListProps {
  users: Person[];
  org: Workspace | undefined;
  userRoles: any[];
  handleSettingsClick: (user: Person) => void;
  handleDeleteClick: (user: Person) => void;
}

export interface AssignUserModalProps extends ModalProps {
  loading: boolean;
  onSubmit: (body: any) => void;
  user?: Person;
  setLoading: (value: boolean) => void;
  addToast: (title: string, color: 'danger' | 'success') => void;
}

export interface Repository {
  workspace_uuid?: string;
  name?: string;
  url?: string;
}

export interface Phase {
  uuid: string;
  feature_uuid: string;
  name: string;
  priority: number;
  phase_purpose?: string;
  phase_outcome?: string;
  phase_scope?: string;
  phase_design?: string;
}

export type PhaseOperationType = 'create' | 'edit' | 'delete';

export interface PhaseOperationMessage {
  title: string;
  message: string;
}
