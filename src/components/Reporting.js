import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// We need to install recharts for data visualization
// npm install recharts --save

const COLORS = [
  '#3C76A9', '#9C54AD', '#EB2726', '#6DC19C', '#F69757', '#FFCF4F', 
  '#2c5a85', '#7d4389', '#c41413', '#56a582', '#d47b3e', '#e6b426'
];

const Reporting = ({ projects }) => {
  const [reportType, setReportType] = useState('project'); // 'project' or 'task'
  const [timeRange, setTimeRange] = useState('all'); // 'day', 'week', 'month', 'all'
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  // Calculate the start date based on the selected time range
  const getStartDate = () => {
    const now = new Date();
    
    switch(timeRange) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(now.setDate(diff));
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return null; // All time
    }
  };

  // Process data for charts based on filters
  useEffect(() => {
    const startDate = getStartDate();
    let filteredProjects = Array.isArray(projects) ? [...projects] : [];
    
    // Filter by project if a specific project is selected
    if (selectedProjectId !== 'all') {
      filteredProjects = filteredProjects.filter(project => project.id === selectedProjectId);
    }
    
    // Process data based on report type
    if (reportType === 'project') {
      // Project-based reporting
      const data = filteredProjects.map(project => {
        if (!project.tasks || !Array.isArray(project.tasks)) {
          return {
            name: project.name,
            hours: 0,
            totalSeconds: 0,
          };
        }
        
        const totalSeconds = project.tasks.reduce((total, task) => {
          // Apply date filter if needed
          if (startDate && new Date(task.createdAt) < startDate) {
            return total;
          }
          return total + (task.timeSpent || 0);
        }, 0);
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const totalHours = hours + (minutes / 60);
        
        return {
          name: project.name,
          hours: parseFloat(totalHours.toFixed(2)),
          totalSeconds,
        };
      });
      
      // Sort by hours (descending)
      data.sort((a, b) => b.hours - a.hours);
      
      setReportData(data);
      setTotalHours(data.length > 0 ? data.reduce((total, item) => total + item.hours, 0).toFixed(2) : 0);
      
    } else {
      // Task-based reporting
      let allTasks = [];
      
      filteredProjects.forEach(project => {
        if (!project.tasks || !Array.isArray(project.tasks)) return;
        
        const tasks = project.tasks
          .filter(task => !startDate || new Date(task.createdAt) >= startDate)
          .map(task => ({
            name: task.name,
            projectName: project.name,
            hours: parseFloat(((task.timeSpent || 0) / 3600).toFixed(2)),
            totalSeconds: task.timeSpent || 0,
          }));
        
        allTasks = [...allTasks, ...tasks];
      });
      
      // Sort by hours (descending)
      allTasks.sort((a, b) => b.hours - a.hours);
      
      setReportData(allTasks);
      setTotalHours(allTasks.length > 0 ? allTasks.reduce((total, item) => total + item.hours, 0).toFixed(2) : 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, reportType, timeRange, selectedProjectId]);

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };

  // Export to CSV functionality
  const handleExportCSV = () => {
    try {
      // Generate CSV content
      let csvContent = "";
      
      // Add report title
      csvContent += `Time Tracker Report - ${reportType === 'project' ? 'By Project' : 'By Task'}\n`;
      csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
      
      // Add filter information
      let timeFilterText = 'All Time';
      if (timeRange === 'day') timeFilterText = 'Today';
      if (timeRange === 'week') timeFilterText = 'This Week';
      if (timeRange === 'month') timeFilterText = 'This Month';
      
      const projectFilterText = selectedProjectId === 'all' 
        ? 'All Projects' 
        : `Project: ${projects.find(p => p.id === selectedProjectId)?.name || ''}`;
      
      csvContent += `Filters: ${timeFilterText}, ${projectFilterText}\n`;
      csvContent += `Total Hours: ${totalHours}\n\n`;
      
      // Add table headers
      if (reportType === 'project') {
        csvContent += "Project,Time Spent,Hours,Percentage\n";
      } else {
        csvContent += "Task,Project,Time Spent,Hours,Percentage\n";
      }
      
      // Add data rows
      reportData.forEach(item => {
        const percentage = ((item.hours / totalHours) * 100).toFixed(1) + '%';
        
        if (reportType === 'project') {
          csvContent += `"${item.name}","${formatTime(item.totalSeconds)}",${item.hours},${percentage}\n`;
        } else {
          csvContent += `"${item.name}","${item.projectName}","${formatTime(item.totalSeconds)}",${item.hours},${percentage}\n`;
        }
      });
      
      // Create a download link and trigger it
      const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `time-tracker-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('CSV generation error:', error);
      alert('There was an error generating the CSV. Please check the console for details.');
    }
  };

  return (
    <div className="reporting">
      <div className="project-header">
        <h1>Time Reports</h1>
        <div className="report-actions">
          <div className="subject-line">Total time: {totalHours} hours</div>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            Export to CSV
          </button>
        </div>
      </div>
      
      <div className="card mb-lg">
        <h3 className="section-title mb-md">Filters</h3>
        <div className="filters">
          <div className="form-group">
            <label htmlFor="reportType">Report Type</label>
            <select 
              id="reportType" 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="project">By Project</option>
              <option value="task">By Task</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="timeRange">Time Range</label>
            <select 
              id="timeRange" 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="projectFilter">Project</label>
            <select 
              id="projectFilter" 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">All Projects</option>
              {Array.isArray(projects) && projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {reportData.length > 0 ? (
        <div className="reports-container">
          <div className="card mb-lg">
            <h3 className="section-title mb-md">
              {reportType === 'project' ? 'Time by Project' : 'Time by Task'}
            </h3>
            <div className="chart-container" style={{ height: '400px' }} ref={barChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Hours', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }} 
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} hours`, name]}
                    labelStyle={{ fontFamily: 'var(--font-body)' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="hours" 
                    fill="var(--color-blue)" 
                    name="Hours" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card mb-lg">
            <h3 className="section-title mb-md">Time Distribution</h3>
            <div className="chart-container" style={{ height: '400px' }} ref={pieChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="hours"
                    nameKey="name"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} hours (${(value / totalHours * 100).toFixed(1)}%)`, props.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card">
            <h3 className="section-title mb-md">Detailed Data</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{reportType === 'project' ? 'Project' : 'Task'}</th>
                    {reportType === 'task' && <th>Project</th>}
                    <th>Time Spent</th>
                    <th>Hours</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      {reportType === 'task' && <td>{item.projectName}</td>}
                      <td>{formatTime(item.totalSeconds)}</td>
                      <td>{item.hours}</td>
                      <td>{((item.hours / totalHours) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <p>No data available for the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default Reporting; 