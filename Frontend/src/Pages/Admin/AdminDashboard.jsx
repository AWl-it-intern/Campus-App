// import React from 'react'; 
import { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  Award, 
  UserCheck,
  FileText,
  ListChecks,
  UsersRound,
  BarChart3,
  LogOut,
  BriefcaseBusinessIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateUsers from './CreateUsers';
import CreateJob from './CreateJob';

const HRDashboard = () => {
  const navigate = useNavigate();

  // State for managing candidates and jobs
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'users', 'jobs'

  // Color palette
  const colors = {
    primary: {
      stonewash: '#003329',
      softFlow: '#6AE8D3',
      mossRock: '#66D095',
      rainShadow: '#00988D'
    },
    secondary: {
      goldenHour: '#DEBF6C',
      marigoldFlame: '#FFAD53',
      clayPot: '#E0B9AD'
    }
  };

  // Handle candidates update from CreateUsers component
  const handleCandidatesUpdate = (updatedCandidates) => {
    setCandidates(updatedCandidates);
  };

  // Handle jobs update from CreateJob component
  const handleJobsUpdate = (updatedJobs) => {
    setJobs(updatedJobs);
  };

  // Handle job assignments from CreateJob component
  const handleJobAssignment = (candidateJobMap) => {
    // Update candidates with their assigned jobs
    const updatedCandidates = candidates.map(candidate => {
      const jobs = candidateJobMap[candidate.id] || [];
      return {
        ...candidate,
        AssignedJob: jobs.join(', ')
      };
    });
    
    setCandidates(updatedCandidates);
  };

  // Get recent users (last 5)
  const getRecentUsers = () => {
    return candidates.slice(-5).reverse();
  };

  // Stats data - now using real data
  const statsData = [
    { 
      title: 'Total jobs', 
      count: jobs.length, // Dynamic count from CreateJob
      icon: BriefcaseBusinessIcon, 
      bgColor: colors.primary.rainShadow,
      lightBg: '#E8F9F0'
    },
    { 
      title: 'Shortlisted', 
      count: 4, 
      icon: ListChecks, 
      bgColor: colors.primary.mossRock,
      lightBg: '#E8F9F0' 
    },
    { 
      title: 'Selected', 
      count: 1, 
      icon: Award, 
      bgColor: colors.secondary.marigoldFlame,
      lightBg: '#FFF4E6' 
    },
    { 
      title: 'Panelists', 
      count: 3, 
      icon: UsersRound, 
      bgColor: colors.secondary.goldenHour,
      lightBg: '#FFF9E6' 
    },
  ];

  // Quick actions data - updated with dynamic job count
  const quickActions = [
    { 
      title: 'View All jobs', 
      subtitle: `${jobs.length} jobs`, // Dynamic count
      icon: BriefcaseBusinessIcon,
      color: colors.primary.rainShadow,
      action: () => setActiveView('jobs')
    },
    { 
      title: 'Manage Users', 
      subtitle: `${candidates.length} candidates`, 
      icon: Users,
      color: colors.primary.mossRock,
      action: () => setActiveView('users')
    },
    { 
      title: 'Shortlist Candidates', 
      subtitle: '0 pending review', 
      icon: CheckCircle,
      color: colors.primary.mossRock
    },
    { 
      title: 'Manage Panelists', 
      subtitle: '3 active panelists', 
      icon: UsersRound,
      color: colors.secondary.goldenHour
    },
    { 
      title: 'View Results', 
      subtitle: 'Assessment scores & recommendations', 
      icon: BarChart3,
      color: colors.secondary.marigoldFlame
    }
  ];

  // Application status data
  const applicationStatus = [
    { label: 'Submitted', count: 0, color: '#94A3B8' },
    { label: 'Shortlisted', count: 4, color: colors.primary.mossRock },
    { label: 'GD Pending', count: 1, color: colors.secondary.marigoldFlame },
    { label: 'PI Pending', count: 0, color: '#94A3B8' },
    { label: 'Selected', count: 1, color: colors.primary.rainShadow },
    { label: 'Rejected', count: 1, color: '#EF4444' },
  ];

  // Recent applications data - now using real data from CreateUsers
  const recentApplications = getRecentUsers().map(user => ({
    name: user.name,
    college: user.college,
    email: user.email,
    date: new Date().toLocaleDateString('en-GB'),
    status: user.AssignedJob ? 'Assigned' : 'Pending',
    statusColor: user.AssignedJob ? colors.primary.mossRock : '#94A3B8'
  }));

  // If no recent users, show default data
  const displayApplications = recentApplications.length > 0 ? recentApplications : [
    { 
      name: 'Rahul Sharma', 
      college: 'Indian Institute of Technology, Delhi', 
      date: '15/1/2026',
      status: 'Shortlisted',
      statusColor: colors.primary.mossRock
    },
    { 
      name: 'Priya Patel', 
      college: 'National Institute of Technology, Trichy', 
      date: '16/1/2026',
      status: 'Shortlisted',
      statusColor: colors.primary.mossRock
    },
    { 
      name: 'Arjun Reddy', 
      college: 'BITS Pilani', 
      date: '18/1/2026',
      status: 'GD Pending',
      statusColor: colors.secondary.marigoldFlame
    },
    { 
      name: 'Sneha Iyer', 
      college: 'Delhi Technological University', 
      date: '12/1/2026',
      status: 'Selected',
      statusColor: colors.primary.rainShadow
    },
    { 
      name: 'Karthik Menon', 
      college: 'Anna University', 
      date: '20/1/2026',
      status: 'Rejected',
      statusColor: '#EF4444'
    },
  ];

  // Assessment progress data
  const assessmentProgress = [
    {
      title: 'Group Discussion',
      completed: 3,
      total: 4,
      pending: 1,
      color: colors.primary.rainShadow
    },
    {
      title: 'Personal Interview',
      completed: 2,
      total: 4,
      pending: 0,
      color: colors.primary.mossRock
    }
  ];

  // Render different views based on activeView
  if (activeView === 'users') {
    return (
      <div>
        {/* Header for navigation */}
        <header 
          className="fixed top-0 left-0 right-0 z-50 shadow-md"
          style={{ backgroundColor: colors.primary.stonewash }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="text-white hover:text-opacity-80 transition-all"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-white">User Management</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">Anita Desai</p>
                  <p className="text-xs" style={{ color: colors.primary.softFlow }}>HR</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="pt-20">
          <CreateUsers onCandidatesUpdate={handleCandidatesUpdate} />
        </div>
      </div>
    );
  }

  if (activeView === 'jobs') {
    return (
      <div>
        {/* Header for navigation */}
        <header 
          className="fixed top-0 left-0 right-0 z-50 shadow-md"
          style={{ backgroundColor: colors.primary.stonewash }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="text-white hover:text-opacity-80 transition-all"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-white">Job Management</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">Anita Desai</p>
                  <p className="text-xs" style={{ color: colors.primary.softFlow }}>HR</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="pt-20">
          <CreateJob 
            candidates={candidates} 
            onJobAssignment={handleJobAssignment}
            onJobsUpdate={handleJobsUpdate}
          />
        </div>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 shadow-md"
        style={{ backgroundColor: colors.primary.stonewash }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Brand Section */}
            <div>
              <h1 className="text-2xl font-bold text-white">Campus Recruit</h1>
              <p className="text-sm" style={{ color: colors.primary.softFlow }}>
                Hiring Made Simple
              </p>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-semibold">Anita Desai</p>
                <p className="text-xs" style={{ color: colors.primary.softFlow }}>
                  HR
                </p>
              </div>
              <button 
                className="btn btn-sm btn-circle bg-white hover:bg-gray-100 border-0"
                aria-label="Logout"
              >
                <LogOut size={18} color={colors.primary.stonewash} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - with top padding to account for fixed header */}
      <main className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Title Section */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: colors.primary.stonewash }}>
              HR Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Manage recruitment process and track candidates
            </p>
          </section>

          {/* Stats Cards Section */}
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="card bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="card-body p-6">
                      <div className="flex items-center gap-4">
                        {/* Icon Container */}
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: stat.lightBg }}
                        >
                          <Icon size={28} color={stat.bgColor} />
                        </div>

                        {/* Stats Info */}
                        <div className="flex-1">
                          <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                          <p
                            className="text-3xl font-bold"
                            style={{ color: stat.bgColor }}
                          >
                            {stat.count}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Actions Section */}
          <section className="mb-8">
            <div className="card bg-white shadow-lg">
              <div className="card-body p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary.stonewash }}>
                  Quick Actions
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        className="card bg-gray-50 hover:bg-white transition-all duration-300 cursor-pointer border-2 border-transparent hover:scale-[1.02]"
                        onClick={action.action || (() => navigate(action.path))}
                        style={{ 
                          '--hover-border-color': action.color 
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = action.color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <div className="card-body p-4">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: action.color + '20' }}
                            >
                              <Icon size={24} color={action.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 mb-1">
                                {action.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {action.subtitle}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Application Status + Recent Applications (Side by Side) */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Application Status */}
              <div className="card bg-white shadow-lg">
                <div className="card-body p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary.stonewash }}>
                    Application Status
                  </h3>
                  
                  <div className="space-y-3">
                    {applicationStatus.map((status, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: status.color }}
                          ></div>
                          <span className="text-gray-700">{status.label}</span>
                        </div>
                        <span 
                          className="badge badge-lg font-semibold"
                          style={{ 
                            backgroundColor: status.color + '20',
                            color: status.color,
                            border: 'none'
                          }}
                        >
                          {status.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-6">
                    <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
                      {applicationStatus.map((status, index) => {
                        const total = applicationStatus.reduce((sum, s) => sum + s.count, 0);
                        const percentage = total > 0 ? (status.count / total) * 100 : 0;
                        return percentage > 0 ? (
                          <div
                            key={index}
                            className="transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: status.color
                            }}
                          ></div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="card bg-white shadow-lg">
                <div className="card-body p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold" style={{ color: colors.primary.stonewash }}>
                      Recent Users
                    </h3>
                    {candidates.length > 0 && (
                      <button
                        onClick={() => setActiveView('users')}
                        className="text-sm font-medium hover:underline"
                        style={{ color: colors.primary.mossRock }}
                      >
                        View All →
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {displayApplications.map((application, index) => (
                      <div
                        key={index}
                        className="card bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:shadow-md"
                        onClick={() => console.log('Clicked:', application.name)}
                      >
                        <div className="card-body p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800 truncate">
                                  {application.name}
                                </h4>
                                <span 
                                  className="badge badge-sm font-medium shrink-0"
                                  style={{ 
                                    backgroundColor: application.statusColor + '20',
                                    color: application.statusColor,
                                    border: 'none'
                                  }}
                                >
                                  {application.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                                {application.college}
                              </p>
                              <p className="text-xs text-gray-500">
                                {application.email ? `Email: ${application.email}` : `Applied: ${application.date}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Assessment Progress Section */}
          <section className="mb-8">
            <div className="card bg-white shadow-lg">
              <div className="card-body p-6">
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary.stonewash }}>
                  Assessment Progress
                </h3>
                <p className="text-sm text-gray-600 mb-6">Track GD and PI assessments</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assessmentProgress.map((assessment, index) => {
                    const percentage = (assessment.completed / assessment.total) * 100;
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-800 mb-4">
                          {assessment.title}
                        </h4>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold" style={{ color: assessment.color }}>
                              {assessment.completed}/{assessment.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full transition-all duration-500 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: assessment.color
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Completed</p>
                            <p className="text-2xl font-bold" style={{ color: assessment.color }}>
                              {assessment.completed}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-gray-400">
                              {assessment.pending}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-gray-600 text-sm py-4">
            © 2026 Campus Recruit. All rights reserved.
          </footer>

        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
