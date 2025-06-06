# Schedulant
Author: Mengen.dai

WeChart: DME_000000

Email: mengen.dai@outlook.com

Note: Schedulant is a project based on Typescript React, it is designed specifically for React projects, so it cannot work properly in non-React projects.

## What is Schedulant
* Schedulant is a fully responsive Gantt Chart React Component, designed specifically for project management and scheduling. It includes two sections: the left side outlines a list of tasks, while the right side has a timeline with schedule bars that visualize work.
* Schedulant can assist you in planning for the success of each project. The flexible Gantt Chart in Full Schedule allows you easily collaborate with your team on the timeline, track the progress of projects, and keep the team's workflow running smoothly and efficiently.

## Version
* Alpha:
    * Stage: Early development phase.
    * Description: The software may not yet have complete functionality and might contain many unresolved bugs. Typically used for internal testing only.
    * Naming Example: 1.0.0-alpha1, 1.0.0-alpha2
* Stage: Feature-complete phase.
    * Description: The main focus is on bug fixes and performance optimization. Usually offered to a small group of users for testing.
    * Naming Example: 1.0.0-beta1, 1.0.0-beta2
* Release Candidate (RC):
    * Stage: Pre-release phase.
    * Description: The software is close to the final version, and if no major issues are found, this version could become the official release.
    * Naming Example: 1.0.0-rc1, 1.0.0-rc2
* Release:
    * Stage: Official release.
    * Description: The version is fully tested and ready for production, available to all users.
    * Naming Example: 1.0.0, 1.1.0
* Hotfix:
    * Stage: Emergency bug fix.
    * Description: Used to quickly address critical bugs or security issues in a released version, with minimal changes to other parts of the code.
    * Naming Example: 1.0.1, 1.0.2
* Patch:
    * Stage: Minor update.
    * Description: Involves small bug fixes or minor feature enhancements, ensuring stability and continuous improvement of the software.
    * Naming Example: 1.1.1, 1.1.2

## Key Features
* Schedulant supports simple configuration. This means that developers can quickly start using Full Schedule without the need for complex setup or installation processes.
* Schedulant supports custom **holiday** configuration for the timeline. This means that developers can add specifically holiday information to the timeline according to their needs, making schedule management more flexible and personalized.
* Schedulant supports visualizing important dates, checkpoints, and milestones to ensure tasks are completed on time.
* Schedulant supports  users in modifying the position of **events**, **milestones**, and **checkpoints** on the timeline by **dragging** with the mouse.
* Schedulant supports **day**, **month**, **quarter**, and **year** views. This means that users can choose the view that best suits their needs and preferences to view and manage their schedule.
* Schedulant supports **exporting images**. This means that users can export their schedule or project timeline in the form of images, which is convenient for sharing and archiving.
* Schedulant supports **customizing row height and column width**. This means that users can adjust the row height and column width of the schedule according to their needs and preferences, making the display of the schedule more in line with their visual habits.

## Previews

* Day view
  ![Day view](https://github.com/DAIMENGEN/schedulant/blob/master/example/previews/day.png?raw=true)

* Week view
  ![Week view](https://github.com/DAIMENGEN/schedulant/blob/master/example/previews/week.png?raw=true)

* Month view
  ![Month view](https://github.com/DAIMENGEN/schedulant/blob/master/example/previews/month.png?raw=true)

* Quarter view
  ![Month view](https://github.com/DAIMENGEN/schedulant/blob/master/example/previews/quarter.png?raw=true)

* Year view
  ![Month view](https://github.com/DAIMENGEN/schedulant/blob/master/example/previews/year.png?raw=true)

## Props

* **start:** Start date of the schedule view.
* **end:** End date of the schedule view.
* **editable:** Whether editing the schedule is allowed; if the current value is `false`, properties such as `eventMove`, `eventResizeStart`, `eventResizeEnd`, `milestonesMove`, and `checkpointMove` will become ineffective.
* **lineHeight:** Sets the line height of the schedule.
* **slotMinWidth:** Determines how wide each of the time-axis slots will be. Specified as a number of pixels. When not specified, a reasonable value will be automatically computed.
* **schedulantMaxHeight:** Sets the max height of the entire schedule.
* **schedulantViewType:** Sets the view type of the schedule. Currently, support day, week, month quarter and year view.
* **events:** An array of event objects that will be displayed on the schedule.
* **resources:** Tells the schedule to display resources from an array input. The resource's id property is the most important because is allows associating events with resources.
* **milestones:** An array of milestones objects that will be displayed on the schedule. (**Note:** This property is optional)
* **checkpoints:** An array of milestones objects that will be displayed on the schedule. (**Note:** This property is optional)
* **companyHolidays:** An array of company holidays that will be used to mark company holidays on the schedule. (**Note:** This property is optional)
* **specialWorkdays:** An array of special workdays that will be used to mark special workdays on the schedule. (**Note:** This property is optional)
* **nationalHolidays:** An array of national holidays that will be used to mark national holidays on the schedule. (**Note:** This property is optional)
* **resourceAreaWidth:** Determines the width of the area that contains the list of resources. Can be specified as a number of pixels, or a CSS string value, like "25%". default: "30%" (**Note:** This property is optional)
* **resourceAreaColumns:** Turns the resource area from a plain list of titles into a grid of data. An array of objects can be provided, each with information about a column. (**Note:** This property is optional)
* **selectAllow:** Exact programmatic control over where the user can select. This callback will be called for every new potential selection as the user is dragging. (**Note:** This property is optional)
* **enableEventContextMenu:** Whether to enable the right-click menu functionality for event. (**Note:** This property is optional)
* **eventContextMenuClick:** The event triggered when an option in the event's right-click menu is clicked. (**Note:** This property is optional)
* **eventContextMenuItems:** Configure options in the event's right-click menu. (**Note:** This property is optional)
* **eventDidMount:** Called right after the element has been added to the DOM. If the event data changes, this is NOT called again. (**Note:** This property is optional)
* **eventWillUnmount:** Called right before the element will be removed from the DOM. (**Note:** This property is optional)
* **eventMove:** Triggered when event move begins. (**Note:** This property is optional)
* **eventResizeStart:** Triggered when resizing stops and the event start date has changed in duration. (**Note:** This property is optional)
* **eventResizeEnd:** Triggered when resizing stops and the event end date has changed in duration. (**Note:** This property is optional)
* **enableMilestoneContextMenu:** Whether to enable the right-click menu functionality for milestone. (**Note:** This property is optional)
* **milestoneContextMenuClick:** The milestone triggered when an option in the milestone's right-click menu is clicked. (**Note:** This property is optional)
* **milestoneContextMenuItems:** Configure options in the milestone's right-click menu. (**Note:** This property is optional)
* **milestoneDidMount:** Called right after the element has been added to the DOM. If the milestone data changes, this is NOT called again. (**Note:** This property is optional)
* **milestoneWillUnmount:** Called right before the element will be removed from the DOM. (**Note:** This property is optional)
* **milestoneMove:** Triggered when milestone move begins. (**Note:** This property is optional)
* **enableCheckpointContextMenu:** Whether to enable the right-click menu functionality for checkpoint. (**Note:** This property is optional)
* **checkpointContextMenuClick:** The checkpoint triggered when an option in checkpoint's right-click menu is clicked. (**Note:** This property is optional)
* **checkpointContextMenuItems:** Configure options in the checkpoint's right-click menu. (**Note:** This property is optional)
* **checkpointDidMount:** Called right after the element has been added to the DOM. If the checkpoint data changes, this is NOT called again. (**Note:** This property is optional)
* **checkpointWillUnmount:** Called right before the element will be removed from the DOM. (**Note:** This property is optional)
* **checkpointMove:** Triggered when event move begins. (**Note:** This property is optional)
* **enableResourceLaneContextMenu:** Whether to enable the right-click menu functionality for resource lane. (**Note:** This property is optional)
* **resourceLaneContextMenuClick:** The resource lane triggered when an option in resource lane's right-click menu is clicked. (**Note:** This property is optional)
* **resourceLaneContextMenuItems:** Configure options in the resource lane's right-click menu. (**Note:** This property is optional)
* **resourceLaneDidMount:** Called right after the element has been added to the DOM. If the resource data changes, this is NOT called again. (**Note:** This property is optional)
* **resourceLaneWillUnmount:** Called right before the element will be removed from the DOM. (**Note:** This property is optional)
* **enableResourceLabelContextMenu:** Whether to enable the right-click menu functionality for resource label. (**Note:** This property is optional)
* **resourceLabelContextMenuClick:** The resource label triggered when an option in resource lane's right-click menu is clicked. (**Note:** This property is optional)
* **resourceLabelContextMenuItems:** Configure options in the resource lane's right-click menu. (**Note:** This property is optional)
* **resourceLabelDidMount:** Called right after the element has been added to the DOM. If the resource label data changes, this is NOT called again. (**Note:** This property is optional)
* **resourceLabelWillUnmount:** Called right before the element will be removed from the DOM. (**Note:** This property is optional)
* **timelineSlotLabelDidMount:** Called right after the element has been added to the DOM. (**Note:** This property is optional)
* **timelineSlotLabelWillUnmount:** Called right before the element will be removed from the DOM. (**Note:** This property is optional)
* **timelineSlotLaneDidMount:** Called right after the element has been added to the DOM. (**Note:** This property is optional)
* **timelineSlotLaneWillUnmount:** Called right before the element will be removed from the DOM. (**Note:** This property is optional)
* **schedulantDidMount:** Called right after the element has been added to the DOM. (**Note:** This property is optional)
* **schedulantWillUnmount:** Called right before the element will be removed from the DOM. (**Note:** This property is optional)
