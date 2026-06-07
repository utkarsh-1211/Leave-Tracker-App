import { api, LightningElement, wire } from 'lwc';
import getLeaveRequests from '@salesforce/apex/LeaveRequstController.getLeaveRequests';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    { label: 'Request Id', fieldName: 'Name', cellAttributes: { style: { fieldName: 'idStyle' } } },
    { label: 'User', fieldName: 'userName', cellAttributes: { style: { fieldName: 'userStyle' } } },
    { label: 'From Date', fieldName: 'From_Date__c', cellAttributes: { style: { fieldName: 'cellStyle' } } },
    { label: 'To Date', fieldName: 'To_Date__c', cellAttributes: { style: { fieldName: 'cellStyle' } } },
    { label: 'Reason', fieldName: 'Reason__c', cellAttributes: { style: { fieldName: 'cellStyle' } } },
    { label: 'Status', fieldName: 'Status__c', cellAttributes: { style: { fieldName: 'cellStyle' } } },
    { label: 'Manager Comment', fieldName: 'Manager_Comment__c', cellAttributes: { style: { fieldName: 'cellStyle' } } },
    {
        type: "button", typeAttributes: {
            label: 'Edit',
            name: 'Edit',
            title: 'Edit',
            value: 'edit',
            disabled: { fieldName: 'isEditDisabled' }
        }, cellAttributes: { style: { fieldName: 'buttonCellStyle' } }
    }
];
export default class LeaveRequests extends LightningElement {
    columns = COLUMNS;

    leavesReqeusts = [];
    leavesReqeustsWireResult;
    showModalPopup = false;
    objectApiName = 'LeaveRequest__c';
    recordId = '';
    currentUserId = Id;
    @wire(getLeaveRequests)
    wiredMyLeaves(result) {
        this.leavesReqeustsWireResult = result;
        if (result.data) {
            this.leavesReqeusts = result.data.map(a => {
                // base row background and common padding/height
                let baseStyle = '';
                const status = (a.Status__c || '').toString().toLowerCase();
                if (status === 'approved') {
                    baseStyle = 'background-color: #0a6f2e; color: white; font-weight: 600; padding: 18px 12px; font-size: 14px;';
                } else if (status === 'rejected') {
                    baseStyle = 'background-color: #ff8c00; color: white; font-weight: 600; padding: 18px 12px; font-size: 14px;';
                } else if (status === 'pending') {
                    baseStyle = ''; // keep default (white) for pending rows
                }

                return {
                    ...a,
                    userName: a.User__r.Name,
                    // apply base style across row cells
                    cellStyle: baseStyle,
                    idStyle: baseStyle + ' padding-left: 24px; font-weight: 800;',
                    userStyle: baseStyle + ' padding-left: 12px; font-weight: 800;',
                    buttonCellStyle: baseStyle + ' display:flex; align-items:center; justify-content:center; padding-right:24px;',
                    isEditDisabled: a.Status__c != 'Pending'
                };
            });
        }
        if (result.error) {
            console.log('Error occured while fetching my leaves- ', result.error);
        }
    }

    get noRecordsFound() {
        return this.leavesReqeusts.length == 0;
    }

    newRequestClickHandler() {
        this.showModalPopup = true;
        this.recordId = '';
    }
    popupCloseHandler() {
        this.showModalPopup = false;
    }

    rowActionHandler(event) {
        this.showModalPopup = true;
        this.recordId = event.detail.row.Id;
    }

    successHandler(event) {
        this.showModalPopup = false;
        this.showToast('Data saved successfully');
        this.refreshGrid();
        console.log('LeaveRequests: Dispatching refreshmyleaves event');
        const refreshEvent = new CustomEvent('refreshmyleaves', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(refreshEvent);
        // Also dispatch a window event so sibling components that are not rendered can refresh
        try {
            // set a global flag so components that mount later can pick up the change
            window.__refreshmyleaves = Date.now();
            window.dispatchEvent(new CustomEvent('refreshmyleaves'));
        } catch (e) {
            // ignore
        }
    }

    @api
    refreshGrid() {
        refreshApex(this.leavesReqeustsWireResult);
    }

    connectedCallback() {
        this._windowRefreshHandler = () => {
            try {
                refreshApex(this.leavesReqeustsWireResult);
            } catch (e) {
            }
        };
        window.addEventListener('refreshmyleaves', this._windowRefreshHandler);
        try {
            if (window.__refreshmyleaves) {
                refreshApex(this.leavesReqeustsWireResult);
                delete window.__refreshmyleaves;
            }
        } catch (e) {
        }
    }

    disconnectedCallback() {
        if (this._windowRefreshHandler) {
            window.removeEventListener('refreshmyleaves', this._windowRefreshHandler);
        }
    }
    showToast(message, title = 'success', variant = 'success') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}