import { Component, OnInit } from '@angular/core';
import { echartStyles } from 'src/app/shared/echart-styles';
import { ActivityService } from 'src/app/shared/services/activity.service';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { Activity } from 'src/app/shared/models/activity.model';
import { EChartOption } from 'echarts';

@Component({
  selector: 'app-dashboard-v5',
  templateUrl: './dashboard-v5.component.html',
  styleUrls: ['./dashboard-v5.component.scss']
})
export class DashboardV5Component implements OnInit {
  chartLineSmall1: any;
  lineChart1: any;
  domainChartPie: EChartOption;
  statusChartPie: EChartOption;
  categoryChartPie: EChartOption;
  activities: any[] = [];
  activityForm: FormGroup;
  canceledActivitiesCount: number = 0; // Property to store the number of canceled activities
  finishedActivitiesCount: number = 0; // Property to store the number of canceled activities


  constructor(
    private activityService: ActivityService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.chartLineSmall1 = {
      ...echartStyles.defaultOptions,
      grid: echartStyles.gridAlignLeft,
      series: [{
        data: [30, 40, 20, 50, 40, 80, 90, 40],
        ...echartStyles.smoothLine,
        lineStyle: {
          color: '#4CAF50',
          ...echartStyles.lineShadow
        },
        itemStyle: {
          color: '#4CAF50'
        }
      }]
    };
  
    this.lineChart1 = {
      ...echartStyles.lineFullWidth,
      series: [{
        data: [80, 40, 90, 20, 80, 30, 90, 30, 80, 10, 70, 30, 90],
        ...echartStyles.smoothLine,
        markArea: {
          label: {
            show: true
          }
        },
        areaStyle: {
          color: 'rgba(102, 51, 153, .15)',
          origin: 'start'
        },
        lineStyle: {
          color: 'rgba(102, 51, 153, 0.68)',
        },
        itemStyle: {
          color: '#663399'
        }
      }, {
        data: [20, 80, 40, 90, 20, 80, 30, 90, 30, 80, 10, 70, 30],
        ...echartStyles.smoothLine,
        markArea: {
          label: {
            show: true
          }
        },
        areaStyle: {
          color: 'rgba(255, 152, 0, 0.15)',
          origin: 'start'
        },
        lineStyle: {
          color: 'rgba(255, 152, 0, .6)',
        },
        itemStyle: {
          color: 'rgba(255, 152, 0, 1)'
        }
      }]
    };
  
    this.activityForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required] // Initialize status control
    });
  
    this.loadActivities();
  }
  
  loadActivities(): void {
    this.activityService.getActivities().subscribe(
      (data: any[]) => {
        console.log('Activities:', data);
        this.activities = data;
        this.generateDataAndChart_category(data);
        this.generateDataAndChart_status(data);

        this.calculateCanceledActivities(); // Calculate canceled activities
        this.calculateFinishedActivities(); // Calculate canceled activities

      },
      (error) => {
        console.error('Error loading activities:', error);
      }
    );
  }
  

  addActivity(): void {
  
    if (this.activityForm.valid) {
      const newActivity: Activity = {
        name: this.activityForm.value.name,
        description: this.activityForm.value.description,
        category: this.activityForm.value.category,
        date: new Date(this.activityForm.value.date), // Assuming date is a valid ISO string
        time: this.activityForm.value.time,
        location: this.activityForm.value.location,
        status: this.activityForm.value.status
      };
      this.activityService.addActivity(newActivity).subscribe(
        (response) => {
          console.log('Activity added successfully:', response);
          // Optionally, perform actions after successful addition
          this.loadActivities();
        },
        (error) => {
          console.error('Error adding activity:', error);
          // Handle error cases
        }
      );
    } else {
      // Form validation failed, handle accordingly
    }
  }

update(row: any): void {
  const updatedActivity: Activity = {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    date: row.date,
    time: row.time,
    location: row.location,
    status: row.status
  };

  this.activityService.updateActivity(updatedActivity).subscribe(() => {
    this.loadActivities(); // Refresh the list after update
  }, (error) => {
    console.error('Error updating activity:', error);
    // Handle error cases
  });
}


  delete(row: any): void {
    this.activityService.deleteActivity(row.id).subscribe(() => {
      this.loadActivities(); // Refresh the list
    });
  }

  getRowClass(row: any): string {
    switch (row.status) {
      case 'PLANIFIEE':
        return 'status-planifiee';
      case 'EN_COURS':
        return 'status-en-cours';
      case 'TERMINEE':
        return 'status-terminee';
      case 'ANNULEE':
        return 'status-annulee';
      default:
        return '';
    }
  }
  generateDataAndChart_category(data: any[]): void {
    const nameCounts = data.reduce((acc, data) => {
      acc[data.category] = (acc[data.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    // Ensure 'value' is of type 'number' using type assertion
    const chartData = Object.entries(nameCounts).map(([name, value]) => ({ name, value: value as number }));
  
    this.Chart4(chartData);
  }
  generateDataAndChart_status(data: any[]): void {
    const nameCounts = data.reduce((acc, data) => {
      acc[data.status] = (acc[data.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
    // Ensure 'value' is of type 'number' using type assertion
    const chartData = Object.entries(nameCounts).map(([name, value]) => ({ name, value: value as number }));
  
    this.Chart5(chartData);
  }
  
  
  Chart4(data: { name: string, value: number }[]): void {
    this.categoryChartPie = {
      color: ['#62549c', '#7566b5', '#7d6cbb', '#8877bd', '#9181bd', '#6957af'],
      tooltip: {
        show: true,
        backgroundColor: 'rgba(0, 0, 0, .8)'
      },
      xAxis: [{
        axisLine: {
          show: false
        },
        splitLine: {
          show: false
        }
      }],
      yAxis: [{
        axisLine: {
          show: false
        },
        splitLine: {
          show: false
        }
      }],
      series: [{
        name: 'Category of activity',
        type: 'pie',
        radius: '75%',
        center: ['50%', '50%'],
        data,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }
  Chart5(data: { name: string, value: number }[]): void {
    this.statusChartPie = {
      color: ['#62549c', '#7566b5', '#7d6cbb', '#8877bd', '#9181bd', '#6957af'],
      tooltip: {
        show: true,
        backgroundColor: 'rgba(0, 0, 0, .8)'
      },
      xAxis: [{
        axisLine: {
          show: false
        },
        splitLine: {
          show: false
        }
      }],
      yAxis: [{
        axisLine: {
          show: false
        },
        splitLine: {
          show: false
        }
      }],
      series: [{
        name: 'Status of activity',
        type: 'pie',
        radius: '75%',
        center: ['50%', '50%'],
        data,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }
  calculateCanceledActivities(): void {
    const canceledActivities = this.activities.filter(activity => activity.status === 'ANNULEE');
    this.canceledActivitiesCount = canceledActivities.length;
  }
  calculateFinishedActivities(): void {
    const finishedActivities = this.activities.filter(activity => activity.status === 'TERMINEE');
    this.finishedActivitiesCount = finishedActivities.length;
  }
}
