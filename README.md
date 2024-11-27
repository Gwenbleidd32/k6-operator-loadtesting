Basic Graphana k6 Kubernetes integration
---

This is a quick tutorial on how to use Graphana k6's distributed load tests.
The difference between launching tests via a Kubernetes cluster and using the monolithic service lies in the initial setup and it's capabilities. Essentially, you can scale you single script to as many different pods as your cluster can handle. This allows you to multiply the scales of your tests exponentially.

This means no matter which way you slice it, you have far more testing capabilities without bogging down your individual hardware through using the distributed version.

As you can see in the above repository. We can use the exact same files from my k6 repository. 

So Let's get started!

---
See the below link for Graphana documentation on the k6 operator. *Yes we're installing an operator* https://grafana.com/blog/2022/06/23/running-distributed-load-tests-on-kubernetes/
*While you read this, spin up your Kubernetes cluster*

Now navigate to an empty directory via your terminal or git bash and clone the repository 
```
git clone https://github.com/grafana/k6-operator && cd k6-operator
```

Before we do anything else Bashful Macs open your **terminals** and Windows savages open **PowerShell**.

And Choco install or Brew install the following applications: 

Windows:
```python
choco install make 
choco install kustomize
choco install golang
choco install k6 
```

Mac:
```python
brew install make 
brew install kustomize
brew install golang
brew install k6 
```


After all of our applications are installed. Navigate into the directory of your cloned repo.

Before running the first command, Install the go controller using the following command. 
```
go install sigs.k8s.io/controller-tools/cmd/controller-gen@latest
```

Now we need to make an adjustment to the Makefile in the repo. This is part of the configuration of the k6 operator. I discovered this as an error, and found this solution to be able to stand up k6. 

Open the Makefile in vs code and replace line 15 with the following - *underneath controller gen version* 
```python
CONTROLLER_GEN_VERSION=v0.16.1
CONTROLLER_GEN=controller-gen  # << Replace line 15 with this!
```
*Mac users, please try continuing without doing the above at first, If you get an error message then try making the above edits.*

After making our edits we enter the command `make deploy`. This should now create and provision the k6 operator within your cluster.
```bash
User@Caranthir MINGW64 /c/git/k6 (main)
$ make deploy
```
---
After completion you can leave your git cloned directory and create a fresh working directory to store files. We will be using the files attached in this repo which are the same files we used for the monolithic version of this application.

Now in order to run k6 tests using our Kubernetes environment we use the k6 operator to create batch jobs to run our script. Batch jobs in Kubernetes are pods provisioned to run a specified task and terminate upon completion. Sort of like a preemptible instance in a data proc tool. 

Now batch jobs could be used in a myriad of ways when written and customized, but for today we'll utilize the k6 operator which will operate the logic for us.

Before we create a batch job we need to provision what's called a Configmap. 

A Configmap is essentially a configuration file that can be used by applications/tools across you Kubernetes cluster. Instead of manually defining a specific settings for every single application in your cluster, You can create it once and reference it across multiple applications.

K6 is expects to receive it's java script files through a Configmap.  

Once you have selected a JavaScript file for your load-test. Bring it into your working folder.
```bash
User@Caranthir MINGW64 /c/git/k6 (main)
$ ls
001-small.js  002-medium.js  003-large.js
```
Edit the IP address to match the infrastructure you wish to send traffic too.
```javascript
export default function () {
  const url = 'http://34.32.56.128/';    // Target Istio endpoint or external route
```


We are going to create a configuration file from one of our k6 scripts.

Format the below command for your desired outcome:
```bash
User@Caranthir MINGW64 /c/git/k6 (main)
kubectl create configmap YOUR-NAME-HERE --from-file=./003-large.js --namespace=default
```

Now confirm your .js file was saved as a kubectl configuration:
```bash
User@Caranthir MINGW64 /c/git/k6 (main)
kubectl describe configmap YOUR-NAME-HERE --namespace=default
```

Great so now that we have a config map, Lets create the yaml manifest for our batch job.

Create a new Yaml file using the below template. I named mine `custom-resource.yaml`
```yaml
apiVersion: k6.io/v1alpha1
kind: K6
metadata:
  name: k6-sample
  namespace: default
spec:
  parallelism: 4
  script:
    configMap:
      name: YOUR-NAME-HERE
      file: chaos.js
```
*As you can see we're setting up our jobs to run 4 concurrent pods executing our load test from within the default namespace*


Apply your Yaml and wait a few moments before checking the logs for Kubernetes testing results:
```
kubectl apply -f custom-resource.yaml
```

Now apply the following commands separately to observe the batch job processes of your tests 
```bash
kubectl get k6 

kubectl get jobs 

kubectl get pods 

kubectl logs <pod-name>
```

When using these commands, you'll see the processes as they're running and after completion. 

Since we set our parallelism setting to 4 you should see for pods displaying the information in your default namespace per your command.  

To view the results of successful requests and failed requests from each of your pods running the script. Replace the name in the logs command from the pod name you receive from `kubectl get pods` and you'll see the results from your load test from that induvial pod 

---

Now you can design some pretty devious large scale load tests to use on your applications!

For Kubernetes applications, remember to run the tests from a different namespace than the application you wish to test.

Thank your for reading!
