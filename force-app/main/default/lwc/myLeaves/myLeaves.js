import { api, LightningElement, wire } from 'lwc';
import getMyLeaves from '@salesforce/apex/LeaveRequstController.getMyLeaves';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    { label: 'Request Id', fieldName: 'Name', cellAttributes: { style: { fieldName: 'idStyle' } } },
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
export default class MyLeaves extends LightningElement {
    columns = COLUMNS;

    myLeaves = [];
    myLeavesWireResult;
    showModalPopup = false;
    objectApiName = 'LeaveRequest__c';
    recordId = '';
    currentUserId = Id;
    @wire(getMyLeaves)
    wiredMyLeaves(result) {
        this.myLeavesWireResult = result;
        if (result.data) {
            this.myLeaves = result.data.map(a => {
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
                    cellStyle: baseStyle,
                    idStyle: baseStyle + ' padding-left: 24px; font-weight: 800;',
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
        return this.myLeaves.length == 0;
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
        refreshApex(this.myLeavesWireResult);
        console.log('MyLeaves: Dispatching refreshleaverequests event');
        const refreshEvent = new CustomEvent('refreshleaverequests', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(refreshEvent);
        try {
            window.__refreshleaverequests = Date.now();
            window.dispatchEvent(new CustomEvent('refreshleaverequests'));
        } catch (e) {
        }
    }
    submitHandler(event) {
        event.preventDefault();
        const fields = { ...event.detail.fields };
        fields.Status__c = 'Pending';
        if (new Date(fields.From_Date__c) > new Date(fields.To_Date__c)) {
            this.showToast('From date should not be grater then to date', 'Error', 'error');
        }
        else if (new Date() > new Date(fields.From_Date__c)) {
            this.showToast('From date should not be less then Today', 'Error', 'error');
        }
        else {
            const form = this.template.querySelector('lightning-record-edit-form');
            if (form) {
                form.submit(fields);
            } else {
                this.showToast('Unable to submit the form. Please try again.', 'Error', 'error');
            }
        }
    }
    @api
    refreshGrid() {
        refreshApex(this.myLeavesWireResult);
    }

    connectedCallback() {
        // listen for window events dispatched from sibling components
        this._windowRefreshHandler = () => {
            try {
                refreshApex(this.myLeavesWireResult);
            } catch (e) {
                // ignore
            }
        };
        window.addEventListener('refreshleaverequests', this._windowRefreshHandler);
        // if a refresh was requested before this component mounted, perform it now
        try {
            if (window.__refreshleaverequests) {
                refreshApex(this.myLeavesWireResult);
                // clear flag
                delete window.__refreshleaverequests;
            }
        } catch (e) {
        }
    }

    disconnectedCallback() {
        if (this._windowRefreshHandler) {
            window.removeEventListener('refreshleaverequests', this._windowRefreshHandler);
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