import { LightningElement } from 'lwc';

export default class LeaveTracker extends LightningElement {

    refreshLeaveReqeuestHandler(event) {
        console.log('LeaveTracker: Received refreshleaverequests event');
        const leaveRequests = this.template.querySelector('c-leave-requests');
        if (leaveRequests && typeof leaveRequests.refreshGrid === 'function') {
            console.log('LeaveTracker: Calling leaveRequests.refreshGrid()');
            leaveRequests.refreshGrid();
        } else {
            console.warn('LeaveTracker: Unable to find leaveRequests component or refreshGrid method');
        }
    }

    refreshMyLeavesHandler(event) {
        console.log('LeaveTracker: Received refreshmyleaves event');
        const myLeaves = this.template.querySelector('c-my-leaves');
        if (myLeaves && typeof myLeaves.refreshGrid === 'function') {
            console.log('LeaveTracker: Calling myLeaves.refreshGrid()');
            myLeaves.refreshGrid();
        } else {
            console.warn('LeaveTracker: Unable to find myLeaves component or refreshGrid method');
        }
    }
}