import React, { useEffect } from 'react';

const MicroFrontend = ({ name, host, history, baseUrl = '/' }) => {
  useEffect(() => {
    const scriptId = `micro-frontend-script-${name}`;
    const linkClass = `micro-frontend-link-${name}`;
    const renderMicroFrontend = () => {
      window[`render${name}`] &&
        window[`render${name}`](`${name}-container`, history);
    };

    if (document.getElementById(scriptId)) {
      fetch(`${host}/asset-manifest.json`)
        .then((res) => res.json())
        .then((manifest) => {
          const promises = Object.keys(manifest['files'])
            .filter((key) => key.endsWith('.css'))
            .reduce((sum, key) => {
              sum.push(
                new Promise((resolve) => {
                  const path = `${host}${manifest['files'][key]}`;

                  const link = document.createElement('link');
                  link.className = linkClass;
                  link.onload = () => resolve();
                  link.href = path;
                  link.rel = 'stylesheet';
                  document.head.appendChild(link);
                })
              );
              return sum;
            }, []);
          Promise.allSettled(promises).then(() => {
            renderMicroFrontend();
          });
        });
    } else {
      fetch(`${host}/asset-manifest.json`)
        .then((res) => res.json())
        .then((manifest) => {
          const promises = Object.keys(manifest['files'])
            .filter((key) => key.endsWith('.js') || key.endsWith('.css'))
            .reduce((sum, key) => {
              sum.push(
                new Promise((resolve) => {
                  const path = `${host}${manifest['files'][key]}`;

                  if (key.endsWith('.js')) {
                    const script = document.createElement('script');
                    if (key === 'main.js') {
                      script.id = scriptId;
                    }
                    script.onload = () => {
                      resolve();
                    };
                    script.src = path;
                    document.head.appendChild(script);
                  } else if (key.endsWith('.css')) {
                    const link = document.createElement('link');
                    link.className = linkClass;
                    link.onload = () => resolve();
                    link.href = path;
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                  }
                })
              );
              return sum;
            }, []);
          Promise.allSettled(promises).then(() => {
            renderMicroFrontend();
          });
        });
    }

    return () => {
      window[`unmount${name}`] && window[`unmount${name}`](`${name}-container`);
      Array.from(document.getElementsByClassName(linkClass)).forEach((obj) =>
        obj.remove()
      );
    };
  }, [name, host, history, baseUrl]);

  return <main id={`${name}-container`} />;
};

export default MicroFrontend;

// import React, { useEffect } from 'react';

// const MicroFrontend = ({ name, host, history }) => {
//   useEffect(() => {
//     const scriptId = `micro-frontend-script-${name}`;
//     const renderMicroFrontend = () => {
//       window[`render${name}`] &&
//         window[`render${name}`](`${name}-container`, history);
//     };

//     if (document.getElementById(scriptId)) {
//       renderMicroFrontend();
//       return;
//     }

//     fetch(`${host}/asset-manifest.json`)
//       .then((res) => res.json())
//       .then((manifest) => {
//         const promises = Object.keys(manifest['files'])
//           .filter((key) => key.endsWith('.js'))
//           .reduce((sum, key) => {
//             sum.push(
//               new Promise((resolve) => {
//                 const path = `${host}${manifest['files'][key]}`;
//                 const script = document.createElement('script');
//                 if (key === 'main.js') {
//                   script.id = scriptId;
//                 }
//                 script.onload = () => {
//                   resolve();
//                 };
//                 script.src = path;
//                 document.head.appendChild(script);
//               })
//             );
//             return sum;
//           }, []);
//         Promise.allSettled(promises).then(() => {
//           renderMicroFrontend();
//         });
//       });

//     return () => {
//       window[`unmount${name}`] && window[`unmount${name}`](`${name}-container`);
//     };
//   }, [name, host, history]);

//   return <main id={`${name}-container`} />;
// };

// export default MicroFrontend;
