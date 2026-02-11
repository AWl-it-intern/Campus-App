// import React, { useState } from 'react';  

import { 
  Users, FileText, CheckCircle, Star, UserCheck, 
  ClipboardList, UserCog, BarChart3, LogOut 
} from 'lucide-react';

const HRDashboard = () => {
  // Data
  const statsData = [
    { 
      id: 1, 
      title: 'Total Applications', 
      count: 6, 
      icon: FileText, 
      bgColor: 'bg-[#003329]',
      textColor: 'text-white'
    },
    { 
      id: 2, 
      title: 'Shortlisted', 
      count: 4, 
      icon: CheckCircle, 
      bgColor: 'bg-[#6AE8D3]',
      textColor: 'text-[#003329]'
    },
    { 
      id: 3, 
      title: 'Selected', 
      count: 1, 
      icon: Star, 
      bgColor: 'bg-[#66D095]',
      textColor: 'text-[#003329]'
    },
    { 
      id: 4, 
      title: 'Panelists', 
      count: 3, 
      icon: Users, 
      bgColor: 'bg-[#00988D]',
      textColor: 'text-white'
    }
  ];

  const quickActions = [
    { 
      id: 1, 
      title: 'View All Candidates', 
      subtitle: '6 applications', 
      icon: Users,
      color: 'bg-[#003329]',
      hoverColor: 'hover:bg-[#00988D]'
    },
    { 
      id: 2, 
      title: 'Shortlist Candidates', 
      subtitle: '0 pending review', 
      icon: UserCheck,
      color: 'bg-[#00988D]',
      hoverColor: 'hover:bg-[#003329]'
    },
    { 
      id: 3, 
      title: 'Manage Panelists', 
      subtitle: '3 active panelists', 
      icon: UserCog,
      color: 'bg-[#66D095]',
      hoverColor: 'hover:bg-[#6AE8D3]'
    },
    { 
      id: 4, 
      title: 'View Results', 
      subtitle: 'Assessment scores & recommendations', 
      icon: BarChart3,
      color: 'bg-[#6AE8D3]',
      hoverColor: 'hover:bg-[#66D095]'
    }
  ];

  const applicationStatus = [
    { status: 'Submitted', count: 0, color: 'bg-gray-400' },
    { status: 'Shortlisted', count: 4, color: 'bg-[#6AE8D3]' },
    { status: 'GD Pending', count: 1, color: 'bg-[#FFAD53]' },
    { status: 'PI Pending', count: 0, color: 'bg-[#DEBF6C]' },
    { status: 'Selected', count: 1, color: 'bg-[#66D095]' },
    { status: 'Rejected', count: 1, color: 'bg-red-400' }
  ];

  const recentApplications = [
    { 
      id: 1, 
      name: 'Rahul Sharma', 
      college: 'Indian Institute of Technology, Delhi', 
      date: '15/1/2026',
      status: 'Shortlisted',
      statusColor: 'bg-[#6AE8D3]'
    },
    { 
      id: 2, 
      name: 'Priya Patel', 
      college: 'National Institute of Technology, Trichy', 
      date: '16/1/2026',
      status: 'Shortlisted',
      statusColor: 'bg-[#6AE8D3]'
    },
    { 
      id: 3, 
      name: 'Arjun Reddy', 
      college: 'BITS Pilani', 
      date: '18/1/2026',
      status: 'GD Pending',
      statusColor: 'bg-[#FFAD53]'
    },
    { 
      id: 4, 
      name: 'Sneha Iyer', 
      college: 'Delhi Technological University', 
      date: '12/1/2026',
      status: 'Selected',
      statusColor: 'bg-[#66D095]'
    },
    { 
      id: 5, 
      name: 'Karthik Menon', 
      college: 'Anna University', 
      date: '20/1/2026',
      status: 'Rejected',
      statusColor: 'bg-red-400'
    }
  ];

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const handleCandidateClick = (candidate) => {
    console.log('Candidate clicked:', candidate);
  };

  const handleActionClick = (action) => {
    console.log('Action clicked:', action);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#003329] text-white shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div>
              <h1 className="text-2xl font-bold">Campus Recruit</h1>
              <p className="text-sm text-[#6AE8D3]">Hiring Made Simple</p>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">Anita Desai</p>
                <p className="text-xs text-[#6AE8D3]">HR</p>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-circle btn-ghost hover:bg-[#00988D] transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - with top padding to account for fixed header */}
      <main className="container mx-auto px-4 pt-28 pb-8">
        {/* Page Title Section */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-[#003329] mb-2">HR Dashboard</h2>
          <p className="text-gray-600">Manage recruitment process and track candidates</p>
        </section>

        {/* Stats Cards Row */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={stat.id} 
                  className={`card ${stat.bgColor} ${stat.textColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">{stat.title}</p>
                        <p className="text-4xl font-bold mt-2">{stat.count}</p>
                      </div>
                      <IconComponent className="w-12 h-12 opacity-80" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-[#003329]">Quick Actions</h3>
              <p className="text-gray-600">Manage recruitment workflow</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`card ${action.color} text-white ${action.hoverColor} shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer`}
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-4">
                        <IconComponent className="w-10 h-10" />
                        <div className="text-left">
                          <h4 className="font-semibold text-lg">{action.title}</h4>
                          <p className="text-sm opacity-90">{action.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Application Status + Recent Applications Side by Side */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold text-[#003329] mb-4">Application Status</h3>
              <div className="space-y-4">
                {applicationStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                      <span className="text-gray-700 font-medium">{item.status}</span>
                    </div>
                    <div className="badge badge-lg bg-gray-100 text-[#003329] border-none font-semibold">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold text-[#003329] mb-4">Recent Applications</h3>
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleCandidateClick(app)}
                    className="card bg-gray-50 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#003329] text-lg">{app.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{app.college}</p>
                          <p className="text-xs text-gray-500 mt-1">{app.date}</p>
                        </div>
                        <span className={`badge ${app.statusColor} text-white border-none`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Progress Section */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#003329]">Assessment Progress</h3>
              <p className="text-gray-600">Track GD and PI assessments</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Group Discussion */}
              <div>
                <h4 className="font-semibold text-lg text-[#003329] mb-3">Group Discussion</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Completed</span>
                      <span className="text-sm font-semibold text-[#66D095]">3/4</span>
                    </div>
                    <progress 
                      className="progress progress-success w-full h-3" 
                      value="75" 
                      max="100"
                      style={{ '--progress-color': '#66D095' }}
                    ></progress>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Pending</span>
                      <span className="text-sm font-semibold text-[#FFAD53]">1/4</span>
                    </div>
                    <progress 
                      className="progress w-full h-3" 
                      value="25" 
                      max="100"
                      style={{ color: '#FFAD53' }}
                    ></progress>
                  </div>
                </div>
              </div>

              {/* Personal Interview */}
              <div>
                <h4 className="font-semibold text-lg text-[#003329] mb-3">Personal Interview</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Completed</span>
                      <span className="text-sm font-semibold text-[#66D095]">2/4</span>
                    </div>
                    <progress 
                      className="progress progress-success w-full h-3" 
                      value="50" 
                      max="100"
                      style={{ '--progress-color': '#66D095' }}
                    ></progress>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Pending</span>
                      <span className="text-sm font-semibold text-[#FFAD53]">0/4</span>
                    </div>
                    <progress 
                      className="progress w-full h-3" 
                      value="0" 
                      max="100"
                      style={{ color: '#FFAD53' }}
                    ></progress>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm py-4">
          <p>© 2026 Campus Recruit. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default HRDashboard;
